"""
[Component 6: Encoding - 1.0 mark]

Base64 Encoding for Binary Data:
- Converts binary data (encrypted files, keys, signatures) to ASCII text
- Essential for storing binary data in MongoDB (text-based)
- Enables transmission over JSON APIs
- Recognizable by '=' or '==' padding at the end
"""

import base64

def encode_to_base64(data: bytes) -> str:
    """
    [Component 6: Base64 Encoding - 1.0 mark]
    
    Converts binary data to Base64 ASCII string:
    - Input: Binary data (bytes)
    - Output: ASCII string with A-Z, a-z, 0-9, +, /
    - Padding: Ends with '=' or '==' if length not divisible by 3
    
    Used for:
    - Encrypted file data (binary ciphertext → text)
    - RSA encrypted keys (binary → text)
    - Digital signatures (binary → text)
    
    Example: b'\\x89\\xd2\\x1a' → 'idIa' or 'YWJj' → 'abc'
    """
    encoded = base64.b64encode(data).decode('utf-8')
    return encoded

def decode_from_base64(base64_str: str) -> bytes:
    """
    Reverse Base64 encoding:
    - Input: Base64 ASCII string
    - Output: Original binary data (bytes)
    
    Used for:
    - Retrieving encrypted data from MongoDB
    - Decoding keys and signatures for cryptographic operations
    """
    decoded = base64.b64decode(base64_str)
    return decoded

def is_base64_encoded(text: str) -> bool:
    """
    Verify if a string is Base64 encoded.
    Useful for lab verification.
    """
    try:
        # Check if it only contains valid Base64 characters
        if not isinstance(text, str):
            return False
        
        # Base64 uses A-Z, a-z, 0-9, +, /, =
        import re
        if not re.match(r'^[A-Za-z0-9+/]*={0,2}$', text):
            return False
        
        # Try decoding
        decoded = base64.b64decode(text)
        # Try encoding back
        reencoded = base64.b64encode(decoded).decode('utf-8')
        
        return reencoded == text
    except Exception:
        return False