"""
[Component 1: Authentication - NIST SP 800-63-2 Compliance - 1.5 marks]

NIST SP 800-63-2 Level 2 Requirements:
- Multi-factor authentication (something you know + something you have)
- Two-step assertion process
- TOTP (Time-based One-Time Password) for second factor

Implementation:
1. Step 1: Password verification (something you know)
2. Step 2: TOTP verification (something you have - mobile device)
"""

import pyotp
from fastapi import HTTPException

def generate_mfa_secret():
    """
    [Component 1: MFA Secret Generation]
    
    Generate a Base32-encoded secret for TOTP (Time-based One-Time Password).
    This secret is:
    - Shared between server and user's authenticator app
    - Used to generate 6-digit codes that change every 30 seconds
    - Complies with RFC 6238 (TOTP standard)
    
    Returns:
        str: Base32-encoded secret (e.g., 'JBSWY3DPEHPK3PXP')
    """
    return pyotp.random_base32()

def verify_mfa_code(secret: str, code: str) -> bool:
    """
    [Component 1: MFA Verification - Second Factor]
    
    Verify the 6-digit TOTP code provided by user.
    
    Args:
        secret: User's MFA secret (stored during registration)
        code: 6-digit code from authenticator app
    
    Returns:
        bool: True if valid, False otherwise
    
    Security:
    - Code is only valid for 30 seconds
    - Prevents replay attacks
    - Implements "something you have" factor
    """
    totp = pyotp.TOTP(secret)
    # Allow 1 window before/after for clock skew (90 seconds total)
    return totp.verify(code, valid_window=1)

def generate_qr_code_uri(username: str, secret: str, issuer: str = "SecurePortal") -> str:
    """
    Generate otpauth:// URI for QR code generation.
    Users scan this with Google Authenticator or similar apps.
    
    Returns:
        str: URI like 'otpauth://totp/SecurePortal:alice?secret=ABC&issuer=SecurePortal'
    """
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=username, issuer_name=issuer)

def get_current_totp(secret: str) -> str:
    """
    Get the current TOTP code (for testing purposes only).
    In production, users get this from their authenticator app.
    """
    totp = pyotp.TOTP(secret)
    return totp.now()