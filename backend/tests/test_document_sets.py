import pytest

@pytest.mark.asyncio
async def test_document_sets_and_tasks_flow(client):
    # 1. Register & Login
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "legal.ops@docutrace.io",
            "password": "LegalPassword123!",
            "full_name": "Legal Counsel",
            "role": "legal"
        }
    )
    assert reg_res.status_code == 201
    token = (await client.post(
        "/api/v1/auth/login",
        json={"email": "legal.ops@docutrace.io", "password": "LegalPassword123!"}
    )).json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Document Set
    set_res = await client.post(
        "/api/v1/document-sets/",
        json={"name": "Q3 Vendor Master Set", "description": "Reconciling PO and Invoice"},
        headers=headers
    )
    assert set_res.status_code == 201
    set_data = set_res.json()["data"]
    set_id = set_data["id"]
    assert set_data["name"] == "Q3 Vendor Master Set"

    # 3. Create Custom Action Task
    task_res = await client.post(
        "/api/v1/tasks/",
        json={
            "title": "Review Vendor NDA Terms",
            "description": "Examine clause 14 for non-standard indemnity",
            "priority": "high"
        },
        headers=headers
    )
    assert task_res.status_code == 201
    task_data = task_res.json()["data"]
    task_id = task_data["id"]
    assert task_data["priority"] == "high"
    assert task_data["status"] == "pending"

    # 4. Update Task Status
    update_res = await client.patch(
        f"/api/v1/tasks/{task_id}",
        json={"status": "completed"},
        headers=headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["data"]["status"] == "completed"

    # 5. List Tasks
    list_tasks_res = await client.get("/api/v1/tasks/", headers=headers)
    assert list_tasks_res.status_code == 200
    assert len(list_tasks_res.json()["data"]) == 1

    # 6. Test Dashboard Summary
    dash_res = await client.get("/api/v1/dashboard/summary", headers=headers)
    assert dash_res.status_code == 200
    assert "total_tasks" in dash_res.json()["data"]
