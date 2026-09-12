import pytest

@pytest.mark.asyncio
async def test_register_and_login_flow(client):
    # 1. Register
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "finance.lead@docutrace.io",
            "password": "SecurePassword123!",
            "full_name": "Finance Lead",
            "role": "finance"
        }
    )
    assert reg_res.status_code == 201
    reg_json = reg_res.json()
    assert reg_json["success"] is True
    assert reg_json["data"]["email"] == "finance.lead@docutrace.io"
    assert reg_json["data"]["role"] == "finance"

    # 2. Login
    login_res = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "finance.lead@docutrace.io",
            "password": "SecurePassword123!"
        }
    )
    assert login_res.status_code == 200
    login_json = login_res.json()
    assert login_json["success"] is True
    access_token = login_json["data"]["access_token"]
    assert access_token is not None

    # Check HttpOnly cookie set
    assert "refresh_token" in login_res.cookies

    # 3. Get /me
    me_res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert me_res.status_code == 200
    me_json = me_res.json()
    assert me_json["data"]["email"] == "finance.lead@docutrace.io"

    # 4. Refresh token
    refresh_res = await client.post("/api/v1/auth/refresh")
    assert refresh_res.status_code == 200
    refresh_json = refresh_res.json()
    assert "access_token" in refresh_json["data"]

    # 5. Logout
    logout_res = await client.post("/api/v1/auth/logout")
    assert logout_res.status_code == 200
