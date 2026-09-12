import pytest
import io

@pytest.mark.asyncio
async def test_document_upload_and_management(client):
    # 1. Register & Login
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "auditor@docutrace.io",
            "password": "AuditorPassword123!",
            "full_name": "Senior Auditor",
            "role": "auditor"
        }
    )
    assert reg_res.status_code == 201
    user_id = reg_res.json()["data"]["id"]

    login_res = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "auditor@docutrace.io",
            "password": "AuditorPassword123!"
        }
    )
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Upload Document (Mock PDF with valid %PDF header)
    pdf_content = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< >>\n%%EOF"
    files = {
        "file": ("invoice_sample.pdf", io.BytesIO(pdf_content), "application/pdf")
    }
    data = {"document_type": "invoice"}

    upload_res = await client.post(
        "/api/v1/documents/upload",
        files=files,
        data=data,
        headers=headers
    )
    assert upload_res.status_code == 201
    doc_data = upload_res.json()["data"]
    doc_id = doc_data["id"]
    assert doc_data["original_filename"] == "invoice_sample.pdf"
    assert doc_data["document_type"] == "invoice"

    # 3. List Documents
    list_res = await client.get("/api/v1/documents/", headers=headers)
    assert list_res.status_code == 200
    list_json = list_res.json()
    assert list_json["pagination"]["total"] >= 1
    assert any(d["id"] == doc_id for d in list_json["data"])

    # 4. Get Document Details
    detail_res = await client.get(f"/api/v1/documents/{doc_id}", headers=headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["data"]["id"] == doc_id

    # 5. Delete Document
    del_res = await client.delete(f"/api/v1/documents/{doc_id}", headers=headers)
    assert del_res.status_code == 200

    # Verify deleted from active list
    list_after_res = await client.get("/api/v1/documents/", headers=headers)
    assert list_after_res.json()["pagination"]["total"] == 0
