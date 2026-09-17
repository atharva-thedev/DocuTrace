"""
DocuTrace Synthetic Dataset Generator
Generates high-fidelity mock data (10,000 to 50,000+ rows) for training:
1. Document Type Multi-Class Classifier (10 Categories)
2. Status & Compliance Risk Predictor (5 Categories)
3. Cryptographic Ledger & Anomaly Detector (IsolationForest)
"""

import os
import sys
import csv
import random
import hashlib
import argparse
from datetime import datetime, timedelta

# ==============================================================================
# CONFIGURATION & CONSTANTS
# ==============================================================================

FIRST_NAMES = [
    "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
    "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
    "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
    "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
    "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
    "Timothy", "Deborah", "Ronald", "Stephanie", "Jason", "Rebecca", "Edward", "Sharon",
    "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
    "Nicholas", "Angela", "Eric", "Shirley", "Jonathan", "Anna", "Stephen", "Brenda",
    "Larry", "Pamela", "Justin", "Emma", "Scott", "Nicole", "Brandon", "Helen",
    "Benjamin", "Samantha", "Samuel", "Katherine", "Gregory", "Christine", "Alexander", "Debra",
    "Frank", "Rachel", "Patrick", "Carolyn", "Raymond", "Janet", "Jack", "Maria",
    "Dennis", "Heather", "Jerry", "Diane", "Tyler", "Julie", "Aaron", "Joyce",
    "Jose", "Victoria", "Adam", "Kelly", "Nathan", "Christina", "Henry", "Lauren",
    "Douglas", "Joan", "Zachary", "Evelyn", "Peter", "Olivia", "Kyle", "Judith",
    "Noah", "Megan", "Ethan", "Cheryl", "Jeremy", "Martha", "Christian", "Andrea",
    "Walter", "Frances", "Keith", "Hannah", "Austin", "Jacqueline", "Roger", "Ann",
    "Terry", "Gloria", "Sean", "Jean", "Gerald", "Kathryn", "Carl", "Alice",
    "Dylan", "Teresa", "Harold", "Sara", "Jordan", "Janice", "Jesse", "Doris",
    "Bryan", "Madison", "Lawrence", "Julia", "Arthur", "Grace", "Gabriel", "Judy",
    "Bruce", "Abigail", "Logan", "Marie", "Billy", "Denise", "Joe", "Beverly",
    "Alan", "Amber", "Juan", "Theresa", "Elijah", "Marilyn", "Willie", "Danielle",
    "Albert", "Diana", "Wayne", "Brittany", "Randy", "Natalie", "Mason", "Sophia",
    "Vincent", "Rose", "Liam", "Isabella", "Lucas", "Charlotte", "Oliver", "Amelia",
    "Marcus", "Elena", "Kenji", "Chloe", "Zendaya", "Timothée", "Florence", "Austin"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
    "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
    "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
    "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
    "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
    "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
    "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy",
    "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey",
    "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson",
    "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza",
    "Ruiz", "Hughes", "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers",
    "Long", "Ross", "Foster", "Jimenez", "Powell", "Jenkins", "Perry", "Russell",
    "Sullivan", "Bell", "Coleman", "Butler", "Henderson", "Barnes", "Gonzales", "Fisher",
    "Vasquez", "Simmons", "Romero", "Jordan", "Patterson", "Alexander", "Hamilton", "Graham",
    "Reynolds", "Griffin", "Wallace", "Moreno", "West", "Cole", "Hayes", "Bryant",
    "Herrera", "Gibson", "Ellis", "Tran", "Medina", "Aguilar", "Stevens", "Murray",
    "Ford", "Castro", "Marshall", "Owens", "Harrison", "Fernandez", "McDonald", "Woods",
    "Washington", "Kennedy", "Wells", "Vargas", "Henry", "Chen", "Freeman", "Webb",
    "Tucker", "Guzman", "Burns", "Crawford", "Olson", "Simpson", "Porter", "Hunter",
    "Gordon", "Mendez", "Silva", "Shaw", "Snyder", "Mason", "Dixon", "Muñoz"
]

EMAIL_DOMAINS = [
    "corpmail.org", "company.com", "trustnet.io", "example.com", "globalid.org",
    "mail.com", "enterprise.net", "secureverify.com", "federated.gov", "techhub.io"
]

ORGANIZATIONS = {
    "Employment Verification": [
        ("ORG-1446", "Beacon Registry Services"),
        ("ORG-1044", "Workforce Attestation Bureau"),
        ("ORG-1190", "Global HR Trust Consortium"),
        ("ORG-1288", "Equifax Workforce Solutions Partner"),
        ("ORG-1305", "Apex Talent Verification Systems")
    ],
    "Legal Contract": [
        ("ORG-2019", "Apex Legal Group"),
        ("ORG-2104", "LexisNexis Legal Custody"),
        ("ORG-2250", "Consolidated Legal Escrow"),
        ("ORG-2311", "Global Contract Repository"),
        ("ORG-2490", "Ironclad Document Trust")
    ],
    "Tax Return": [
        ("ORG-3341", "State Tax Authority"),
        ("ORG-3109", "Federal Revenue Service Center"),
        ("ORG-3255", "Municipal Tax Registry"),
        ("ORG-3410", "National Tax Records Authority"),
        ("ORG-3580", "Global Tax Compliance Registry")
    ],
    "Financial Statement": [
        ("ORG-1022", "Meridian Document Custody"),
        ("ORG-1396", "Meridian Document Custody"),
        ("ORG-1510", "Deloitte Financial Audit Repository"),
        ("ORG-1640", "PwC Statement Verification Bureau"),
        ("ORG-1780", "KPMG Attestation Services")
    ],
    "Academic Transcript": [
        ("ORG-4401", "Global Education Registry"),
        ("ORG-4120", "National Student Clearinghouse"),
        ("ORG-4280", "Parchment Academic Trust"),
        ("ORG-4390", "University Registrar Consortium"),
        ("ORG-4550", "International Degree Attestation Office")
    ],
    "Medical Record": [
        ("ORG-5021", "Metro Health Data Hub"),
        ("ORG-5140", "Epic Interconnect Registry"),
        ("ORG-5290", "Health Information Exchange (HIE)"),
        ("ORG-5380", "Cerner Clinical Health Custody"),
        ("ORG-5490", "National BioHealth Repository")
    ],
    "Identity Credential": [
        ("ORG-6099", "National Identity Bureau"),
        ("ORG-301", "State Licensing Bureau"),
        ("ORG-6210", "Department of Motor Vehicles Trust"),
        ("ORG-6380", "CLEAR Verified Identity Authority"),
        ("ORG-6490", "Global Passport & Biometric Custody")
    ],
    "Real Estate Deed": [
        ("ORG-7110", "County Land Registry"),
        ("ORG-7240", "Title Guarantee & Deed Repository"),
        ("ORG-7390", "Metropolitan Property Records"),
        ("ORG-7450", "State Title & Escrow Bureau"),
        ("ORG-7580", "National Land Ownership Archive")
    ],
    "Patent Filing": [
        ("ORG-8122", "Global IP Office"),
        ("ORG-8250", "USPTO Electronic Patent Ledger"),
        ("ORG-8390", "WIPO International Patent Hub"),
        ("ORG-8440", "European Patent Office Registry"),
        ("ORG-8570", "TechIP Innovation Archive")
    ],
    "Compliance Certificate": [
        ("ORG-9011", "TrustVerify Standards"),
        ("ORG-9180", "BSI Assurance & Certification Hub"),
        ("ORG-9290", "TUV Rheinland Standards Registry"),
        ("ORG-9370", "SGS Global Compliance Office"),
        ("ORG-9480", "AICPA SOC Reporting Authority")
    ]
}

DOCUMENT_TITLE_TEMPLATES = {
    "Employment Verification": [
        "Employment Verification - {last_name}",
        "Proof of Employment & Income - {last_name}",
        "Salary Attestation & Service Letter - {last_name}",
        "Executive Employment Record - {last_name}",
        "Work History Attestation - {first_name} {last_name}",
        "Corporate Staff Verification Certificate - {last_name}",
        "Tenure & Position Verification - {first_name} {last_name}"
    ],
    "Legal Contract": [
        "Commercial Lease Agreement - {last_name} Holdings",
        "Non-Disclosure Agreement (NDA) - {last_name}",
        "Master Services Agreement (MSA) - {first_name} {last_name}",
        "Partnership Agreement - {last_name} Corp",
        "Software Licensing Contract - {last_name} Solutions",
        "Arbitration & Confidentiality Agreement - {last_name}",
        "Vendor Purchase Agreement - {first_name} {last_name}"
    ],
    "Tax Return": [
        "Annual Tax Filing 2024 - {last_name}",
        "Corporate Tax Return Form 1120 - {last_name} LLC",
        "Individual Income Tax Return Form 1040 - {first_name} {last_name}",
        "Quarterly Tax Estimation Statement - {last_name}",
        "State Tax Clearance Certificate - {first_name} {last_name}",
        "Withholding & Wage Tax Statement - {last_name}",
        "Annual Tax Filing 2025 - {first_name} {last_name}"
    ],
    "Financial Statement": [
        "Quarterly Financial Statement Q{quarter} - {last_name}",
        "Annual Balance Sheet 2024 - {last_name} Corp",
        "Audited Income Statement Q{quarter} - {last_name} Enterprises",
        "Statement of Cash Flows - {first_name} {last_name}",
        "Consolidated Financial Audit - {last_name} Group",
        "Mid-Year Financial Audit - {last_name} Capital",
        "Profit and Loss Statement - {first_name} {last_name}"
    ],
    "Academic Transcript": [
        "Official Academic Transcript - {first_name} {last_name}",
        "University Degree Verification - {last_name}",
        "Master of Science Academic Record - {first_name} {last_name}",
        "Bachelor of Engineering Diploma Transcript - {last_name}",
        "Official Grade Report & Transcript - {first_name} {last_name}",
        "Postgraduate Attestation & Diploma - {last_name}",
        "Doctoral Candidacy Verification - {first_name} {last_name}"
    ],
    "Medical Record": [
        "Patient Clinical Summary - {first_name} {last_name}",
        "Hospital Discharge Summary - {last_name}",
        "Immunization & Medical History - {first_name} {last_name}",
        "Diagnostic Pathology Report - {last_name}",
        "Outpatient Clinical Notes - {first_name} {last_name}",
        "Emergency Room Admission Record - {last_name}",
        "Comprehensive Health Summary - {first_name} {last_name}"
    ],
    "Identity Credential": [
        "Digital Passport Identity Credential - {first_name} {last_name}",
        "National Driver License Record - {last_name}",
        "Permanent Resident Card Verification - {first_name} {last_name}",
        "Biometric Identity Attestation - {last_name}",
        "State ID & Citizenship Verification - {first_name} {last_name}",
        "Global Entry Credential Record - {last_name}",
        "Enhanced Driver Identification - {first_name} {last_name}"
    ],
    "Real Estate Deed": [
        "Residential Property Real Estate Deed - {last_name}",
        "Commercial Land Deed - Lot {lot} - {first_name} {last_name}",
        "Suburban Land Title Deed - {last_name}",
        "Industrial Warehouse Property Title - {last_name}",
        "Quitclaim Deed & Property Transfer - {first_name} {last_name}",
        "Warranty Deed & Title Escrow - {last_name}",
        "Commercial Office Deed - {first_name} {last_name}"
    ],
    "Patent Filing": [
        "Autonomous Navigation Patent Filing - {last_name}",
        "Quantum Encryption System Patent - {first_name} {last_name}",
        "AI Neural Architecture Patent - {last_name}",
        "Renewable Battery Storage Patent - {first_name} {last_name}",
        "Biomedical Drug Delivery Formulation Patent - {last_name}",
        "Semiconductor Fabrication Method Patent - {first_name} {last_name}",
        "Machine Vision Processing Patent - {last_name}"
    ],
    "Compliance Certificate": [
        "ISO 27001 Information Security Certificate - {last_name}",
        "SOC 2 Type II Compliance Report - {last_name} Corp",
        "ISO 9001 Quality Management Certificate - {last_name}",
        "HIPAA Security Rule Compliance Certificate - {last_name} Health",
        "ISO 14001 Environmental Management Attestation - {last_name}",
        "PCI-DSS Level 1 Compliance Certification - {last_name}",
        "GDPR & Data Privacy Attestation - {first_name} {last_name}"
    ]
}

# Edge case templates for NLP boundary testing
TRICKY_TEMPLATES = [
    ("Employment Verification", "Contractor Service Agreement & Wage Verification - {last_name}"),
    ("Legal Contract", "Employment & Non-Disclosure Contract - {last_name}"),
    ("Financial Statement", "Tax Assessment & Revenue Balance Sheet - {last_name}"),
    ("Medical Record", "Disability Employment Health Examination - {last_name}"),
    ("Academic Transcript", "Professional License & Transcript Verification - {last_name}"),
    ("Real Estate Deed", "Commercial Lease & Real Estate Title - {last_name}"),
    ("Patent Filing", "Proprietary Algorithm Compliance & Patent Record - {last_name}"),
    ("Tax Return", "Estate Property Tax Deed - {last_name}")
]

# ==============================================================================
# GENERATOR FUNCTION
# ==============================================================================

def generate_record(idx: int, is_outlier: bool = False, is_tricky: bool = False):
    first_name = random.choice(FIRST_NAMES)
    last_name = random.choice(LAST_NAMES)
    recipient_name = f"{first_name} {last_name}"
    
    # Select document type
    doc_types = list(ORGANIZATIONS.keys())
    doc_type = random.choice(doc_types)
    
    # Issuer selection based on document type
    issuer_id, issuer_name = random.choice(ORGANIZATIONS[doc_type])
    
    # Title formatting
    if is_tricky:
        tricky_item = random.choice(TRICKY_TEMPLATES)
        doc_type = tricky_item[0]
        issuer_id, issuer_name = random.choice(ORGANIZATIONS[doc_type])
        document_title = tricky_item[1].format(first_name=first_name, last_name=last_name)
    else:
        template = random.choice(DOCUMENT_TITLE_TEMPLATES[doc_type])
        document_title = template.format(
            first_name=first_name,
            last_name=last_name,
            quarter=random.choice([1, 2, 3, 4]),
            lot=random.randint(1, 99)
        )
    
    # Email generation
    email_clean_name = f"{first_name.lower()}.{last_name.lower()}{random.randint(1, 999)}"
    domain = random.choice(EMAIL_DOMAINS)
    recipient_email = f"{email_clean_name}@{domain}"
    
    # Document ID (12 Hex characters)
    raw_id = hashlib.sha256(f"{idx}-{recipient_name}-{random.random()}".encode()).hexdigest()[:12].upper()
    document_id = f"DOC-{raw_id}"
    
    # Status weighted selection
    # Statuses: Verified (52%), Issued (20%), Pending (12%), Expired (9%), Revoked (7%)
    status_weights = [0.52, 0.20, 0.12, 0.09, 0.07]
    statuses = ["Verified", "Issued", "Pending", "Expired", "Revoked"]
    status = random.choices(statuses, weights=status_weights, k=1)[0]
    
    # Timestamps
    # Start anywhere between Jan 2024 and Jun 2026
    start_epoch = datetime(2024, 1, 1).timestamp()
    end_epoch = datetime(2026, 6, 1).timestamp()
    random_epoch = random.uniform(start_epoch, end_epoch)
    created_dt = datetime.fromtimestamp(random_epoch)
    
    # Determine duration based on status & outlier flags
    if is_outlier:
        # Outliers for Anomaly Detector (e.g., negative duration, massive duration, weird hour)
        duration_seconds = random.choice([
            random.uniform(0, 10),              # Instantaneous anomaly
            random.uniform(60*86400, 180*86400) # Extreme multi-month delay
        ])
    elif status == "Pending":
        duration_seconds = random.uniform(300, 10800) # 5m to 3h
    elif status in ["Verified", "Issued"]:
        duration_seconds = random.uniform(1800, 172800) # 30m to 48h
    elif status == "Expired":
        duration_seconds = random.uniform(86400 * 3, 86400 * 21) # 3 to 21 days
    else:  # Revoked
        duration_seconds = random.uniform(600, 86400 * 5)
        
    updated_dt = created_dt + timedelta(seconds=duration_seconds)
    
    created_at_str = created_dt.strftime("%Y-%m-%d %H:%M:%S")
    updated_at_str = updated_dt.strftime("%Y-%m-%d %H:%M:%S")
    
    # Hashes & Ledger TX
    raw_hash = hashlib.sha256(f"{document_id}-{created_at_str}-{recipient_email}".encode()).hexdigest()
    raw_tx = hashlib.sha256(f"tx-{document_id}-{updated_at_str}-{random.random()}".encode()).hexdigest()
    
    if is_outlier and random.random() < 0.3:
        # Hash length or tx anomaly
        sha256_hash = raw_hash[:48]  # Shorter/corrupted
        blockchain_tx_id = f"0x{raw_tx[:40]}"
    else:
        sha256_hash = raw_hash
        blockchain_tx_id = f"0x{raw_tx}"
        
    return {
        "document_id": document_id,
        "document_title": document_title,
        "document_type": doc_type,
        "issuer_id": issuer_id,
        "issuer_name": issuer_name,
        "recipient_name": recipient_name,
        "recipient_email": recipient_email,
        "status": status,
        "sha256_hash": sha256_hash,
        "blockchain_tx_id": blockchain_tx_id,
        "created_at": created_at_str,
        "updated_at": updated_at_str
    }

def generate_dataset(output_path: str, num_rows: int = 50000):
    print("=" * 70)
    print(f"[*] DocuTrace Synthetic Dataset Generator")
    print(f"    Target: {num_rows:,} rows -> {output_path}")
    print("=" * 70)
    
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    
    fieldnames = [
        "document_id", "document_title", "document_type", "issuer_id",
        "issuer_name", "recipient_name", "recipient_email", "status",
        "sha256_hash", "blockchain_tx_id", "created_at", "updated_at"
    ]
    
    outlier_count = int(num_rows * 0.05)  # 5% anomalies
    tricky_count = int(num_rows * 0.03)   # 3% NLP boundary cases
    
    doc_type_counts = {}
    status_counts = {}
    
    with open(output_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for i in range(1, num_rows + 1):
            is_outlier = (i <= outlier_count)
            is_tricky = (outlier_count < i <= outlier_count + tricky_count)
            
            row = generate_record(i, is_outlier=is_outlier, is_tricky=is_tricky)
            writer.writerow(row)
            
            # Count distributions
            dt = row["document_type"]
            st = row["status"]
            doc_type_counts[dt] = doc_type_counts.get(dt, 0) + 1
            status_counts[st] = status_counts.get(st, 0) + 1
            
            if i % 10000 == 0 or i == num_rows:
                print(f"   [+] Generated {i:,} / {num_rows:,} records...")

    file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print("\n" + "-" * 70)
    print(f"[OK] Generation Complete: {output_path} ({file_size_mb:.2f} MB)")
    print("-" * 70)
    
    print("\n[+] Document Type Distribution (10 Classes):")
    for k, v in sorted(doc_type_counts.items(), key=lambda x: x[1], reverse=True):
        pct = (v / num_rows) * 100
        print(f"   - {k:<26}: {v:>6,} ({pct:.2f}%)")
        
    print("\n[+] Status Distribution (5 Classes):")
    for k, v in sorted(status_counts.items(), key=lambda x: x[1], reverse=True):
        pct = (v / num_rows) * 100
        print(f"   - {k:<15}: {v:>6,} ({pct:.2f}%)")
    print("=" * 70)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate synthetic dataset for DocuTrace ML models.")
    parser.add_argument("--rows", type=int, default=50000, help="Number of rows to generate (default: 50000)")
    parser.add_argument("--output", type=str, default="ml/doctrace_50k_mock_data.csv", help="Output CSV path")
    args = parser.parse_args()
    
    generate_dataset(output_path=args.output, num_rows=args.rows)
