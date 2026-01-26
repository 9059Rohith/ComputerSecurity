// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const isValidPassword = (password) => {
  // Minimum 8 characters, at least one uppercase, one lowercase, one number
  return password.length >= 8;
};

// Validate strong password
export const isStrongPassword = (password) => {
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongRegex.test(password);
};

// Validate username
export const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

// Validate MFA code (6 digits)
export const isValidMFACode = (code) => {
  const mfaRegex = /^[0-9]{6}$/;
  return mfaRegex.test(code);
};

// Validate file size
export const isValidFileSize = (file, maxSizeInBytes) => {
  return file.size <= maxSizeInBytes;
};

// Get password strength level
export const getPasswordStrength = (password) => {
  if (password.length === 0) return { level: 0, text: '', color: 'gray' };
  if (password.length < 6) return { level: 1, text: 'Weak', color: 'red' };
  if (password.length < 8) return { level: 2, text: 'Fair', color: 'orange' };
  
  let strength = 2;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[@$!%*?&]/.test(password)) strength++;
  
  if (strength <= 3) return { level: 2, text: 'Fair', color: 'orange' };
  if (strength <= 4) return { level: 3, text: 'Good', color: 'yellow' };
  return { level: 4, text: 'Strong', color: 'green' };
};
