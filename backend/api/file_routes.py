from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from db.mongodb_client import file_collection
from core.security import access_matrix, hybrid_crypto, signatures, encoding_ops
from datetime import datetime, timedelta
from typing import Optional
import secrets

router = APIRouter()

class UploadRequest(BaseModel):
    filename: str = Field(..., example="confidential_report.pdf")
    owner_username: str = Field(..., example="alice")
    expiry_minutes: Optional[int] = Field(60, description="File expiry time in minutes", example=60)

class UploadResponse(BaseModel):
    file_id: str
    message: str
    encrypted_data_sample: str
    digital_signature: str
    expiry_at: str

class DownloadRequest(BaseModel):
    user_role: str = Field(..., description="User role: Admin/Manager/Recipient", example="Admin")

class DownloadResponse(BaseModel):
    filename: str
    encrypted_data: str
    encrypted_aes_key: str
    digital_signature: str
    decrypted_content: str
    is_binary: bool
    message: str

@router.post("/upload",
             response_model=UploadResponse,
             summary="Upload & Encrypt File (Hybrid Crypto + Signatures)",
             description="""
             **Security Components Demonstrated:**
             - **Hybrid Encryption**: AES-256 for data + RSA for key (Component 3 - 1.5m)
             - **Digital Signature**: RSA signature for integrity (Component 5 - 1.5m)
             - **Base64 Encoding**: Binary data encoded for transport (Component 6 - 1.0m)
             - **Access Expiry**: Temporal policy enforcement (Component 2 - 1.5m)
             
             File is encrypted and stored securely with time-based access control.
             """,
             tags=["File Operations"])
async def upload_file(
    file: UploadFile = File(..., description="File to upload"),
    owner_username: str = Form(..., example="alice"),
    expiry_minutes: int = Form(60, description="Expiry time in minutes"),
    user_role: str = Form(..., description="User role for permission check", example="Admin")
):
    """
    Upload and encrypt a file using hybrid cryptography.
    Generates digital signature for integrity verification.
    Implements temporal access control with expiry timestamps.
    """
    # [Component 2: Access Control Matrix - Check upload permission]
    if user_role not in access_matrix.ACL_MATRIX:
        raise HTTPException(
            status_code=403,
            detail=f"Access denied: Invalid role '{user_role}'"
        )
    
    if "upload" not in access_matrix.ACL_MATRIX.get(user_role, []):
        raise HTTPException(
            status_code=403,
            detail=f"Access denied: Role '{user_role}' not permitted to upload files"
        )
    
    # Read file content
    content = await file.read()
    
    # [Component 3: Hybrid Encryption - AES + RSA Key Exchange]
    encrypted_result = hybrid_crypto.encrypt_file(content)
    
    # [Component 5: Digital Signatures for Integrity]
    signature = signatures.sign_data(content)
    
    # [Component 6: Base64 Encoding for Binary Data]
    encrypted_data_b64 = encoding_ops.encode_to_base64(encrypted_result['encrypted_data'])
    encrypted_key_b64 = encoding_ops.encode_to_base64(encrypted_result['encrypted_aes_key'])
    signature_b64 = encoding_ops.encode_to_base64(signature)
    
    # [Component 2: Access Expiry - Temporal Policy]
    expiry_time = datetime.utcnow() + timedelta(minutes=expiry_minutes)
    
    file_id = secrets.token_urlsafe(16)
    file_doc = {
        "_id": file_id,
        "filename": file.filename,
        "owner": owner_username,
        "encrypted_data": encrypted_data_b64,
        "encrypted_aes_key": encrypted_key_b64,
        "digital_signature": signature_b64,
        "uploaded_at": datetime.utcnow(),
        "expiry_at": expiry_time
    }
    
    await file_collection.insert_one(file_doc)
    
    return {
        "file_id": file_id,
        "message": f"File encrypted and uploaded successfully. Expires at {expiry_time.isoformat()}Z UTC",
        "encrypted_data_sample": encrypted_data_b64[:50] + "...",
        "digital_signature": signature_b64[:50] + "...",
        "expiry_at": expiry_time.isoformat() + "Z"
    }

@router.post("/download/{file_id}",
             response_model=DownloadResponse,
             summary="Download File (Access Control Matrix + Expiry Check)",
             description="""
             **Security Components Demonstrated:**
             - **Access Control Matrix**: 3 roles × 3 objects (Component 2 - 1.5m)
             - **Policy Enforcement**: Checks expiry timestamp (Component 2 - 1.5m)
             - Returns encrypted data with AES key and signature
             - 403 error if user lacks permission or file expired
             
             Test with different roles to verify ACM enforcement.
             """,
             tags=["File Operations"])
async def download_file(file_id: str, request: DownloadRequest):
    """
    Download file with Access Control Matrix and expiry policy enforcement.
    Verifies user role permissions before granting access.
    Denies access if file has expired (temporal policy).
    """
    file = await file_collection.find_one({"_id": file_id})
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # [Component 2: Access Control Matrix + Policy Enforcement]
    try:
        access_matrix.authorize_access(
            subject=request.user_role,
            operation="download",
            expiry_time=file['expiry_at']
        )
    except HTTPException as e:
        # Re-raise with detailed message for Swagger testing
        if "expired" in str(e.detail).lower():
            raise HTTPException(
                status_code=403,
                detail=f"Access denied: File expired at {file['expiry_at'].isoformat()}"
            )
        raise HTTPException(
            status_code=403,
            detail=f"Access denied: Role '{request.user_role}' not permitted to download"
        )
    
    # [Component 3: Decrypt the file for actual download]
    try:
        # Decode from Base64
        encrypted_data = encoding_ops.decode_from_base64(file['encrypted_data'])
        encrypted_aes_key = encoding_ops.decode_from_base64(file['encrypted_aes_key'])
        
        print(f"Debug: encrypted_data length: {len(encrypted_data)}")
        print(f"Debug: encrypted_aes_key length: {len(encrypted_aes_key)}")
        
        # Decrypt the file using hybrid crypto
        decrypted_result = hybrid_crypto.decrypt_file(encrypted_data, encrypted_aes_key)
        
        print(f"Debug: Decryption successful, data length: {len(decrypted_result['decrypted_data'])}")
        
        # Try to decode as text, fallback to base64 if binary
        is_binary = False
        try:
            decrypted_content = decrypted_result['decrypted_data'].decode('utf-8')
        except UnicodeDecodeError:
            # If not text, encode as base64 for transport
            decrypted_content = encoding_ops.encode_to_base64(decrypted_result['decrypted_data'])
            is_binary = True
    except Exception as e:
        print(f"Debug: Decryption error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Decryption failed: {str(e)}"
        )
    
    return {
        "filename": file['filename'],
        "encrypted_data": file['encrypted_data'],
        "encrypted_aes_key": file['encrypted_aes_key'],
        "digital_signature": file['digital_signature'],
        "decrypted_content": decrypted_content,
        "is_binary": is_binary,
        "message": "File decrypted successfully. You can now download or view the content."
    }

@router.get("/list",
            summary="List All Uploaded Files",
            description="View all files in the system with their encryption and expiry details.",
            tags=["File Operations"])
async def list_files():
    """
    List all files with their security metadata.
    Useful for verification during lab evaluation.
    """
    files = await file_collection.find().to_list(100)
    return {
        "total_files": len(files),
        "files": [
            {
                "file_id": f['_id'],
                "filename": f['filename'],
                "owner": f['owner'],
                "uploaded_at": f['uploaded_at'].isoformat() + "Z",
                "expiry_at": f['expiry_at'].isoformat() + "Z",
                "has_encryption": bool(f.get('encrypted_data')),
                "has_signature": bool(f.get('digital_signature'))
            }
            for f in files
        ]
    }

@router.delete("/delete/{file_id}",
               summary="Delete File (Admin Only)",
               description="""
               **Security Components Demonstrated:**
               - **Access Control Matrix**: Only Admin role can delete (Component 2 - 1.5m)
               - Permanently removes file from database
               - 403 error if user lacks delete permission
               
               Test with different roles to verify ACM enforcement.
               """,
               tags=["File Operations"])
async def delete_file(file_id: str, user_role: str):
    """
    Delete file with Access Control Matrix enforcement.
    Only Admin role has delete permission.
    """
    # [Component 2: Access Control Matrix - Check delete permission]
    if user_role not in access_matrix.ACL_MATRIX:
        raise HTTPException(
            status_code=403,
            detail=f"Access denied: Invalid role '{user_role}'"
        )
    
    if "delete" not in access_matrix.ACL_MATRIX.get(user_role, []):
        raise HTTPException(
            status_code=403,
            detail=f"Access denied: Role '{user_role}' not permitted to delete files. Only Admin can delete."
        )
    
    # Check if file exists
    file = await file_collection.find_one({"_id": file_id})
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Delete the file
    result = await file_collection.delete_one({"_id": file_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=500, detail="Failed to delete file")
    
    return {
        "message": f"File '{file['filename']}' deleted successfully",
        "file_id": file_id,
        "filename": file['filename']
    }