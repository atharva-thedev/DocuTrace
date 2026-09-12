from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from loguru import logger
import traceback

from app.models.document import Document, DocumentPage, DocumentChunk
from app.models.extraction import ExtractedField
from app.models.anomaly import AnomalyRecord
from app.models.obligation import Obligation
from app.models.risk_score import RiskScore
from app.models.task import ActionTask

from app.services.ocr_service import OCRAndLayoutService
from app.services.extraction_service import InformationExtractionService
from app.services.anomaly_service import FinancialAnomalyDetectionService
from app.services.obligation_service import ObligationExtractionService
from app.services.risk_engine import ExplainableRiskScoringEngine
from app.services.action_engine import ObligationActionEngine
from app.services.summary_service import DocumentSummaryService

class DocumentPipelineOrchestrator:
    """Orchestrates the complete DocuTrace document processing lifecycle (Steps 1 through 8)."""

    @staticmethod
    async def process_document_pipeline(
        document_id: str,
        db: AsyncSession
    ) -> None:
        """Execute full asynchronous document analysis pipeline."""
        try:
            # 1. Fetch document
            result = await db.execute(select(Document).where(Document.id == document_id))
            doc = result.scalar_one_or_none()
            if not doc:
                logger.error(f"Document {document_id} not found for pipeline processing.")
                return

            doc.status = "processing"
            await db.commit()

            # 2. Step 2: Document Processing & OCR Layout Understanding
            logger.info(f"Pipeline Step 2: Parsing layout & OCR for document {doc.filename}")
            parsed_data = OCRAndLayoutService.parse_document(doc.file_path, doc.mime_type)
            doc.page_count = parsed_data.get("page_count", 1)
            doc.extracted_text = parsed_data.get("full_text", "")

            # Store document pages & layout chunks
            created_chunks = []
            for p in parsed_data.get("pages", []):
                dpage = DocumentPage(
                    document_id=doc.id,
                    page_number=p["page_number"],
                    width=p.get("width", 612.0),
                    height=p.get("height", 792.0),
                    text_content=p.get("text", ""),
                )
                db.add(dpage)

                for ch in p.get("chunks", []):
                    dchunk = DocumentChunk(
                        document_id=doc.id,
                        page_number=ch["page_number"],
                        bbox=ch.get("bbox"),
                        content=ch.get("text", "")
                    )
                    db.add(dchunk)
                    created_chunks.append(dchunk)

            await db.flush()

            # 3. Step 3: Information Extraction
            logger.info(f"Pipeline Step 3: Extracting structured fields for {doc.filename}")
            extracted_fields_data = InformationExtractionService.extract_fields(
                doc.extracted_text,
                doc.document_type,
                parsed_data.get("pages", [])
            )
            created_fields = []
            for ef in extracted_fields_data:
                field_obj = ExtractedField(
                    document_id=doc.id,
                    field_category=ef["field_category"],
                    field_key=ef["field_key"],
                    field_value=ef["field_value"],
                    normalized_value=ef.get("normalized_value"),
                    confidence_score=ef.get("confidence_score", 1.0),
                    page_number=ef.get("page_number", 1),
                    bbox=ef.get("bbox"),
                )
                db.add(field_obj)
                created_fields.append(field_obj)

            await db.flush()

            # 4. Step 4: Financial Anomaly & Missing Info Detection
            logger.info(f"Pipeline Step 4: Running anomaly detection on {doc.filename}")
            # Fetch historical documents of same owner for outlier / duplicate detection
            hist_res = await db.execute(
                select(Document).where(Document.owner_id == doc.owner_id, Document.id != doc.id, Document.status == "completed")
            )
            hist_docs = hist_res.scalars().all()
            hist_list = []
            for hd in hist_docs:
                f_res = await db.execute(select(ExtractedField).where(ExtractedField.document_id == hd.id))
                hist_list.append({"document": hd, "fields": f_res.scalars().all()})

            detected_anomalies_data = FinancialAnomalyDetectionService.detect_anomalies(
                doc, created_fields, hist_list
            )
            created_anomalies = []
            for anom in detected_anomalies_data:
                anom_obj = AnomalyRecord(
                    document_id=doc.id,
                    anomaly_type=anom["anomaly_type"],
                    severity=anom["severity"],
                    title=anom["title"],
                    description=anom["description"],
                    score=anom.get("score", 0.0),
                    details=anom.get("details"),
                )
                db.add(anom_obj)
                created_anomalies.append(anom_obj)

            await db.flush()

            # 5. Step 5 & 6: Obligation & Event Extraction
            logger.info(f"Pipeline Step 5: Extracting contractual obligations for {doc.filename}")
            obligations_data = ObligationExtractionService.extract_obligations(
                doc, created_fields, parsed_data.get("pages", [])
            )
            created_obligations = []
            for obl in obligations_data:
                obl_obj = Obligation(
                    document_id=doc.id,
                    category=obl["category"],
                    title=obl["title"],
                    description=obl["description"],
                    responsible_party=obl["responsible_party"],
                    due_date=obl.get("due_date"),
                    clause_reference=obl.get("clause_reference"),
                    page_number=obl.get("page_number", 1),
                    bbox=obl.get("bbox"),
                    status=obl.get("status", "pending")
                )
                db.add(obl_obj)
                created_obligations.append(obl_obj)

            await db.flush()

            # 6. Step 5 (cont): Explainable Risk Scoring
            logger.info(f"Pipeline Step 6: Computing risk score for {doc.filename}")
            risk_calc = ExplainableRiskScoringEngine.calculate_risk_score(
                detected_anomalies_data,
                obligations_data,
                verification_mismatches=0
            )
            risk_obj = RiskScore(
                document_id=doc.id,
                overall_score=risk_calc["overall_score"],
                risk_level=risk_calc["risk_level"],
                factors=risk_calc["factors"]
            )
            db.add(risk_obj)
            await db.flush()

            # 7. Step 7: Obligation -> Action Engine (Task Auto-generation)
            logger.info(f"Pipeline Step 7: Generating actionable tasks for {doc.filename}")
            gen_tasks = ObligationActionEngine.generate_tasks_from_obligations(doc, created_obligations, doc.owner_id)
            gen_tasks.extend(ObligationActionEngine.generate_tasks_from_anomalies(doc, created_anomalies, doc.owner_id))

            for t_data in gen_tasks:
                task_obj = ActionTask(
                    owner_id=t_data["owner_id"],
                    assignee_id=doc.owner_id,
                    document_id=t_data["document_id"],
                    obligation_id=t_data["obligation_id"],
                    anomaly_id=t_data["anomaly_id"],
                    title=t_data["title"],
                    description=t_data["description"],
                    due_date=t_data["due_date"],
                    priority=t_data["priority"],
                    status=t_data["status"],
                )
                db.add(task_obj)

            # 8. Step 8: Generate Intelligent Executive Summary
            logger.info(f"Pipeline Step 8: Generating summary for {doc.filename}")
            doc.summary = DocumentSummaryService.generate_document_summary(
                doc, created_fields, created_anomalies, created_obligations, risk_obj
            )
            doc.status = "completed"
            await db.commit()
            logger.info(f"✅ Successfully completed pipeline for document {doc.filename} (ID: {doc.id})")

        except Exception as e:
            logger.error(f"❌ Error during document processing pipeline: {e}\n{traceback.format_exc()}")
            await db.rollback()
            try:
                result = await db.execute(select(Document).where(Document.id == document_id))
                failed_doc = result.scalar_one_or_none()
                if failed_doc:
                    failed_doc.status = "failed"
                    failed_doc.error_message = str(e)
                    await db.commit()
            except Exception:
                pass
