"""
Unit and integration tests for Authentication system (test_auth.py).
Tests registration, login, logout, Google authentication, session tokens, and password hashing.
"""

import uuid
import pytest
from fastapi.testclient import TestClient
from src.api.app import api_app
from src.db.seed import seed_database


@pytest.fixture(scope="module")
def client():
    seed_database()
    with TestClient(api_app) as c:
        yield c


def test_auth_registration_success(client):
    """Verify new user registration creates User and Profile records."""
    unique_user = f"newuser_{uuid.uuid4().hex[:8]}"
    resp = client.post("/api/auth/register", json={
        "username": unique_user,
        "email": f"{unique_user}@test.com",
        "password": "Password123!",
        "full_name": "Test User"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["username"] == unique_user
    assert "token" in data


def test_auth_registration_duplicate(client):
    """Verify duplicate user registration is rejected with HTTP 400."""
    resp = client.post("/api/auth/register", json={
        "username": "admin",
        "email": "admin@retailvision.com",
        "password": "anotherpassword",
        "full_name": "Duplicate Admin"
    })
    assert resp.status_code == 400
    assert "already exists" in resp.json()["detail"].lower()


def test_auth_registration_short_password(client):
    """Verify registration rejects passwords shorter than 6 characters."""
    resp = client.post("/api/auth/register", json={
        "username": "shortpwduser",
        "email": "shortpwd@test.com",
        "password": "123"
    })
    assert resp.status_code == 400
    assert "6 characters" in resp.json()["detail"].lower()


def test_auth_login_success(client):
    """Verify admin user can log in with demo credentials."""
    resp = client.post("/api/auth/login", json={
        "login": "admin@retailvision.com",
        "password": "admin123"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "token" in data
    assert data["username"] == "admin"


def test_auth_login_success_alternative_demo_credentials(client):
    """Verify demo login succeeds with password123 and username admin."""
    # Test with email + password123
    resp1 = client.post("/api/auth/login", json={
        "login": "admin@retailvision.com",
        "password": "password123"
    })
    assert resp1.status_code == 200
    assert resp1.json()["success"] is True

    # Test with username + admin123
    resp2 = client.post("/api/auth/login", json={
        "login": "admin",
        "password": "admin123"
    })
    assert resp2.status_code == 200
    assert resp2.json()["success"] is True

    # Test with username + password123
    resp3 = client.post("/api/auth/login", json={
        "login": "admin",
        "password": "password123"
    })
    assert resp3.status_code == 200
    assert resp3.json()["success"] is True


def test_auth_login_invalid_password(client):
    """Verify login with incorrect password returns HTTP 401."""
    resp = client.post("/api/auth/login", json={
        "login": "admin@retailvision.com",
        "password": "incorrect_password"
    })
    assert resp.status_code == 401


def test_auth_login_nonexistent_user(client):
    """Verify login with unknown email returns HTTP 401."""
    resp = client.post("/api/auth/login", json={
        "login": "ghost_user_999@doesnotexist.com",
        "password": "any_password"
    })
    assert resp.status_code == 401


def test_auth_logout(client):
    """Verify logout endpoint returns success."""
    login_resp = client.post("/api/auth/login", json={
        "login": "admin@retailvision.com",
        "password": "admin123"
    })
    token = login_resp.json()["token"]
    resp = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["success"] is True


def test_auth_get_me(client):
    """Verify /auth/me returns current user profile."""
    login_resp = client.post("/api/auth/login", json={
        "login": "admin@retailvision.com",
        "password": "admin123"
    })
    token = login_resp.json()["token"]
    resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["username"] == "admin"
    assert data["email"] == "admin@retailvision.com"


def test_google_login(client):
    """Verify Google sign-in returns authenticated session."""
    resp = client.post("/api/auth/google", json={
        "email": "partner.director@gmail.com",
        "name": "Partner Director"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "token" in data


def test_auth_login_with_whitespace_tolerance(client):
    """Verify demo login handles leading and trailing whitespaces cleanly."""
    resp = client.post("/api/auth/login", json={
        "login": "  admin@retailvision.com  ",
        "password": "  admin123  "
    })
    assert resp.status_code == 200
    assert resp.json()["success"] is True


def test_auth_offline_and_demo_tokens_resolution(client):
    """Verify offline and demo tokens resolve cleanly to admin user."""
    # Offline token
    resp_offline = client.get("/api/auth/me", headers={"Authorization": "Bearer rv_offline_token_12345"})
    assert resp_offline.status_code == 200
    assert resp_offline.json()["username"] == "admin"

    # Demo token
    resp_demo = client.get("/api/auth/me", headers={"Authorization": "Bearer rv_demo_token"})
    assert resp_demo.status_code == 200
    assert resp_demo.json()["username"] == "admin"

