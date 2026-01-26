"""
[Component 5: Digital Signatures - 1.5 marks]

RSA Digital Signatures for:
- Data Integrity: Detects any modification to the original data
- Authenticity: Proves the data came from the claimed source
- Non-repudiation: Signer cannot deny creating the signature

Uses RSA-PSS (Probabilistic Signature Scheme) with SHA-256
"""

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding

# Generate server RSA keys for signing
_signing_private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
_signing_public_key = _signing_private_key.public_key()

def get_signing_keys():
    """Get server's RSA key pair for digital signatures"""
    return _signing_private_key, _signing_public_key

def sign_data(data: bytes, private_key=None):
    """
    [Component 5: Digital Signature Creation - 1.5 marks]
    
    Creates RSA digital signature of data:
    1. Hash the data with SHA-256
    2. Sign the hash with RSA private key using PSS padding
    3. Return signature bytes
    
    This proves:
    - Integrity: Any change to data will result in invalid signature
    - Authenticity: Only holder of private key could create valid signature
    """
    if private_key is None:
        private_key = _signing_private_key
    
    # Sign using RSA-PSS (more secure than PKCS#1 v1.5)
    signature = private_key.sign(
        data,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    
    return signature

def verify_signature(data: bytes, signature: bytes, public_key=None):
    """
    Verify RSA digital signature:
    1. Hash the data with SHA-256
    2. Verify signature matches hash using public key
    3. Raises exception if invalid
    
    Returns True if valid, raises InvalidSignature exception if not.
    """
    if public_key is None:
        public_key = _signing_public_key
    
    try:
        public_key.verify(
            signature,
            data,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return True
    except Exception as e:
        raise ValueError(f"Invalid signature: {str(e)}")