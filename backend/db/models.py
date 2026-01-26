from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class User(BaseModel):
    username: str
    password_hash: str  # [Component 4: Hashing with Salt]
    mfa_secret: str     # [Component 1: NIST MFA]
    public_key: str     # [Component 3: Key Exchange]

class SecureFile(BaseModel):
    filename: str
    owner_id: str
    encrypted_data_base64: str  # [Component 5: Encoding]
    encrypted_aes_key: str      # [Component 3: Key Exchange]
    nonce: str
    digital_signature: str      # [Component 4: Digital Signature]
    expiry_at: datetime         # [Component 2: Access Expiry]