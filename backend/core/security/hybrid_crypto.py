"""
[Component 3: Encryption & Key Exchange - 1.5 marks]

Hybrid Cryptography Implementation:
- AES-256-GCM for symmetric encryption (fast, secure)
- RSA-2048 for asymmetric key exchange (secure key distribution)

This demonstrates the industry-standard approach where:
1. Data is encrypted with AES (symmetric - fast for large data)
2. AES key is encrypted with RSA (asymmetric - secure key exchange)
"""

import os
from pathlib import Path
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization

# Path to store RSA keys
KEY_DIR = Path(__file__).parent.parent.parent / "storage"
PRIVATE_KEY_FILE = KEY_DIR / "private_key.pem"
PUBLIC_KEY_FILE = KEY_DIR / "public_key.pem"

def _load_or_generate_keys():
    """Load existing RSA keys or generate new ones if they don't exist"""
    KEY_DIR.mkdir(parents=True, exist_ok=True)
    
    if PRIVATE_KEY_FILE.exists() and PUBLIC_KEY_FILE.exists():
        # Load existing keys
        with open(PRIVATE_KEY_FILE, "rb") as f:
            private_key = serialization.load_pem_private_key(
                f.read(),
                password=None
            )
        with open(PUBLIC_KEY_FILE, "rb") as f:
            public_key = serialization.load_pem_public_key(f.read())
        print("✅ Loaded existing RSA keys from storage")
    else:
        # Generate new keys
        private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        public_key = private_key.public_key()
        
        # Save keys to files
        with open(PRIVATE_KEY_FILE, "wb") as f:
            f.write(private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ))
        with open(PUBLIC_KEY_FILE, "wb") as f:
            f.write(public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            ))
        print("✅ Generated new RSA keys and saved to storage")
    
    return private_key, public_key

# Load or generate server RSA keys
_private_key, _public_key = _load_or_generate_keys()

def get_server_keys():
    """Get server's RSA key pair for encryption demonstrations"""
    return _private_key, _public_key

def encrypt_file(file_data: bytes, recipient_public_key=None):
    """
    [Component 3: Hybrid Encryption - 1.5 marks]
    
    Encrypts file using hybrid cryptography:
    1. Generate random AES-256 key
    2. Encrypt file data with AES-GCM (authenticated encryption)
    3. Encrypt AES key with RSA public key (key exchange)
    
    Returns:
        dict: {
            'encrypted_data': bytes (AES encrypted),
            'nonce': bytes (12-byte nonce for AES-GCM),
            'encrypted_aes_key': bytes (RSA encrypted AES key)
        }
    """
    if recipient_public_key is None:
        recipient_public_key = _public_key
    
    # [Step 1: Symmetric Encryption with AES-256-GCM]
    aes_key = AESGCM.generate_key(bit_length=256)
    aesgcm = AESGCM(aes_key)
    nonce = os.urandom(12)  # 96-bit nonce for GCM
    
    # Encrypt file data (includes authentication tag)
    ciphertext = aesgcm.encrypt(nonce, file_data, None)
    
    # [Step 2: Asymmetric Key Exchange with RSA-2048]
    # Encrypt the AES key using recipient's public RSA key
    encrypted_aes_key = recipient_public_key.encrypt(
        aes_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    
    return {
        'encrypted_data': ciphertext + nonce,  # Combine for storage
        'encrypted_aes_key': encrypted_aes_key,
        'encryption_algorithm': 'AES-256-GCM + RSA-2048-OAEP'
    }

def decrypt_file(encrypted_data_with_nonce: bytes, encrypted_aes_key: bytes, private_key=None):
    """
    Decrypt file using hybrid cryptography (reverse process):
    1. Decrypt AES key using RSA private key
    2. Decrypt file data using recovered AES key
    """
    if private_key is None:
        private_key = _private_key
    
    try:
        # [Step 1: Decrypt AES key with RSA private key]
        aes_key = private_key.decrypt(
            encrypted_aes_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        
        # [Step 2: Decrypt data with recovered AES key]
        ciphertext = encrypted_data_with_nonce[:-12]
        nonce = encrypted_data_with_nonce[-12:]
        
        aesgcm = AESGCM(aes_key)
        plaintext = aesgcm.decrypt(nonce, ciphertext, None)
        
        return {
            'decrypted_data': plaintext,
            'decryption_algorithm': 'AES-256-GCM + RSA-2048-OAEP'
        }
    except Exception as e:
        raise Exception(f"Encryption/decryption failed: {str(e)}")


def export_public_key_pem(public_key=None):
    """Export RSA public key in PEM format for sharing"""
    if public_key is None:
        public_key = _public_key
    
    pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    return pem.decode('utf-8')