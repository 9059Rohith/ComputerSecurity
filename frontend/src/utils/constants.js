export const APP_NAME = 'Secure Data Portal';
export const APP_VERSION = '2.0.0';
export const LAB_CODE = '23CSE313';

// API Base URL
export const API_BASE_URL = 'http://127.0.0.1:8000';

// User Roles
export const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  RECIPIENT: 'Recipient',
};

// Role Permissions
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ['upload', 'download', 'delete'],
  [ROLES.MANAGER]: ['upload', 'download'],
  [ROLES.RECIPIENT]: ['download'],
};

// Default expiry times (in minutes)
export const EXPIRY_OPTIONS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '6 hours', value: 360 },
  { label: '24 hours', value: 1440 },
];

// Security Components
export const SECURITY_COMPONENTS = [
  { id: 1, name: 'Authentication', marks: 3, icon: '🔐' },
  { id: 2, name: 'Authorization', marks: 3, icon: '🛡️' },
  { id: 3, name: 'Encryption', marks: 3, icon: '🔒' },
  { id: 4, name: 'Hashing & Signatures', marks: 3, icon: '🔑' },
  { id: 5, name: 'Encoding & Theory', marks: 3, icon: '📝' },
];

// File size limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Toast notification durations (ms)
export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  INFO: 3000,
};
