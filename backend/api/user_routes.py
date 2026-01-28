from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from db.mongodb_client import user_collection
from core.security import encoding_ops

router = APIRouter()
router = APIRouter()
class RegisterKeyRequest(BaseModel):
    username: str = Field(..., example="alice")
    public_key: str = Field(..., description="RSA public key in PEM format (Base64 encoded)")

class RegisterKeyResponse(BaseModel):
    message: str
    public_key_preview: str

@router.post("/register-key",
             response_model=RegisterKeyResponse,
             summary="Register User's RSA Public Key",
             description="""
             **Key Exchange Component (Component 3 - 1.5m)**
             - Stores user's RSA public key for hybrid encryption
             - Enables secure AES key exchange
             - Public key should be in PEM format
             - Used to encrypt AES keys for file decryption
             """,
             tags=["Key Management"])
async def register_public_key(request: RegisterKeyRequest):
    """
    Register a user's RSA public key for secure key exchange.
    This enables hybrid encryption where AES keys are encrypted with RSA.
    """
    # Verify user exists
    user = await user_collection.find_one({"username": request.username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Store the user's RSA Public Key for secure Key Exchange
    result = await user_collection.update_one(
        {"username": request.username},
        {"$set": {"public_key": request.public_key}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to register public key")
    
    return {
        "message": "Public key registered successfully for hybrid encryption",
        "public_key_preview": request.public_key[:50] + "..."
    }

@router.get("/verify/{username}",
            summary="Verify User Registration & Security Setup",
            description="""
            Verify that a user is properly registered with all security components:
            - Password hash (with bcrypt salt)
            - MFA secret
            - Role assignment
            - Public key (if registered)
            """,
            tags=["Key Management"])
async def verify_user(username: str):
    """
    Verify user security setup for lab evaluation.
    Shows hashed password, MFA status, role, and key registration.
    """
    user = await user_collection.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "username": user['username'],
        "password_hash_preview": user['password_hash'][:30] + "...",
        "password_properly_hashed": user['password_hash'].startswith("$2b$"),
        "mfa_secret_registered": bool(user.get('mfa_secret')),
        "role": user.get('role', 'Not assigned'),
        "public_key_registered": bool(user.get('public_key'))
    }