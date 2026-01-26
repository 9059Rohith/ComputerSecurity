"""
[Component 4: Hashing with Salt - 1.5 marks]

Bcrypt Password Hashing:
- Automatically generates unique salt for each password
- Salt prevents rainbow table attacks
- Adaptive hashing (configurable work factor)
- Industry standard for password storage

Hash format: $2b$12$[22-char salt][31-char hash]
Example: $2b$12$N9qo8uLOickgx2ZMRZoMy.eS.NI0xYVe.zCLvYOT8B1jU5T7fCNQK
"""

from core.config import settings
import bcrypt

def get_password_hash(password: str) -> str:
    """
    [Component 4: Hash Password with Salt - 1.5 marks]
    
    Securely hash password using bcrypt:
    1. Adds application-wide pepper for extra security
    2. Generates unique random salt (automatically by bcrypt)
    3. Applies bcrypt hashing algorithm (adaptive cost factor)
    
    The resulting hash includes:
    - Algorithm identifier ($2b$)
    - Cost factor (12 = 2^12 iterations)
    - 22-character salt (Base64 encoded)
    - 31-character hash (Base64 encoded)
    
    Args:
        password: Plain text password
    
    Returns:
        str: Bcrypt hash starting with '$2b$12$...'
    
    Security features:
    - Each password gets unique salt (prevents rainbow tables)
    - Pepper adds server-side secret (defense in depth)
    - Slow hashing prevents brute force
    """
    # Add server-side pepper (application secret)
    peppered_password = password + settings.PEPPER
    
    # Generate salt and hash (salt is embedded in the output)
    salt = bcrypt.gensalt(rounds=12)  # 2^12 = 4096 iterations
    hashed = bcrypt.hashpw(peppered_password.encode('utf-8'), salt)
    
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its bcrypt hash.
    
    Args:
        plain_password: Password to verify
        hashed_password: Stored bcrypt hash
    
    Returns:
        bool: True if password matches, False otherwise
    
    Note: Salt is extracted from the hash automatically by bcrypt
    """
    peppered_password = plain_password + settings.PEPPER
    
    try:
        return bcrypt.checkpw(
            peppered_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False