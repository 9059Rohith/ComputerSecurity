from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from core.security import hashing, nist_auth
from db.mongodb_client import user_collection
from core.config import settings
from typing import Optional
import secrets

router = APIRouter()

# Pydantic Models for proper Swagger documentation
class RegisterRequest(BaseModel):
    username: str = Field(..., description="Unique username", example="alice")
    password: str = Field(..., description="Strong password (min 8 chars)", example="SecurePass123!")
    role: Optional[str] = Field("Recipient", description="User role: Admin/Manager/Recipient")

class RegisterResponse(BaseModel):
    message: str
    mfa_qr_secret: str
    qr_code_url: str

class LoginStep1Request(BaseModel):
    username: str = Field(..., description="Your username", example="alice")
    password: str = Field(..., description="Your password", example="SecurePass123!")

class LoginStep1Response(BaseModel):
    message: str
    session_token: str

class LoginStep2Request(BaseModel):
    username: str = Field(..., description="Your username", example="alice")
    session_token: str = Field(..., description="Token from Step 1")
    mfa_code: str = Field(..., description="6-digit TOTP code from authenticator app", example="123456")

class LoginStep2Response(BaseModel):
    access_token: str
    message: str
    role: str

# Store temporary session tokens (in production, use Redis)
session_store = {}

@router.post("/register", 
             response_model=RegisterResponse,
             summary="Register New User (NIST SP 800-63-2 Compliant)",
             description="""
             **Security Features:**
             - Password hashed with bcrypt + salt (Component 4)
             - Generates MFA secret for TOTP-based authentication
             - Assigns role for Access Control Matrix (Component 2)
             - Returns QR code for easy MFA setup
             """,
             tags=["Authentication"])
async def register(user_data: RegisterRequest):
    """
    Register a new user with hashed password and MFA setup.
    This implements NIST SP 800-63-2 Level 2 authentication requirements.
    """
    # Check if user exists
    existing = await user_collection.find_one({"username": user_data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # [Component 4: Hashing with Salt - bcrypt automatically adds salt]
    hashed_pw = hashing.get_password_hash(user_data.password)
    
    # Generate MFA secret for TOTP
    mfa_secret = nist_auth.generate_mfa_secret()
    
    new_user = {
        "username": user_data.username,
        "password_hash": hashed_pw,
        "mfa_secret": mfa_secret,
        "role": user_data.role
    }
    await user_collection.insert_one(new_user)
    
    # Generate QR code URL for Google Authenticator
    qr_url = f"otpauth://totp/SecurePortal:{user_data.username}?secret={mfa_secret}&issuer=SecurePortal"
    
    return {
        "message": "User registered successfully. Scan QR code with Google Authenticator.",
        "mfa_qr_secret": mfa_secret,
        "qr_code_url": qr_url
    }

@router.post("/login/step1",
             response_model=LoginStep1Response,
             summary="Login Step 1: Password Verification",
             description="""
             **Two-Factor Authentication - Step 1 of 2**
             - Verifies username and password (Something you know)
             - Does NOT grant access yet
             - Returns session token for Step 2
             - Complies with NIST SP 800-63-2 multi-factor requirement
             """,
             tags=["Authentication"])
async def login_step1(credentials: LoginStep1Request):
    """
    First authentication factor: verify password.
    This is Step 1 of the two-step assertion process required by NIST SP 800-63-2.
    """
    # [Component 1: Authentication - Single Factor Verification]
    user = await user_collection.find_one({"username": credentials.username})
    if not user or not hashing.verify_password(credentials.password, user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Generate temporary session token
    session_token = secrets.token_urlsafe(32)
    session_store[session_token] = {
        "username": credentials.username,
        "verified_password": True
    }
    
    return {
        "message": "Password verified. Please provide MFA code to complete login.",
        "session_token": session_token
    }

@router.post("/login/step2",
             response_model=LoginStep2Response,
             summary="Login Step 2: MFA Verification (TOTP)",
             description="""
             **Two-Factor Authentication - Step 2 of 2**
             - Verifies TOTP code from authenticator app (Something you have)
             - Completes the two-step assertion process
             - Grants access token only after both factors verified
             - Implements NIST SP 800-63-2 Multi-Factor Authentication (1.5m)
             """,
             tags=["Authentication"])
async def login_step2(mfa_data: LoginStep2Request):
    """
    Second authentication factor: verify TOTP MFA code.
    Only grants access after BOTH password AND MFA are verified.
    This completes the NIST SP 800-63-2 two-step assertion requirement.
    """
    # Verify session token from Step 1
    session = session_store.get(mfa_data.session_token)
    if not session or session.get("username") != mfa_data.username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token"
        )
    
    # Get user and verify MFA code
    user = await user_collection.find_one({"username": mfa_data.username})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    # [Component 1: Multi-Factor Authentication]
    if not nist_auth.verify_mfa_code(user['mfa_secret'], mfa_data.mfa_code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid MFA code"
        )
    
    # Clear session token (single use)
    del session_store[mfa_data.session_token]
    
    # Generate access token (in production, use JWT with expiration)
    access_token = secrets.token_urlsafe(32)
    
    return {
        "access_token": access_token,
        "message": "Authentication successful! Both factors verified.",
        "role": user.get("role", "Recipient")
    }