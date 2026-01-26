import api from './api';

const authService = {
  // Register new user
  register: async (username, password, role = 'Recipient') => {
    const response = await api.post('/auth/register', {
      username,
      password,
      role,
    });
    return response.data;
  },

  // Login Step 1: Password verification
  loginStep1: async (username, password) => {
    const response = await api.post('/auth/login/step1', {
      username,
      password,
    });
    return response.data;
  },

  // Login Step 2: MFA verification
  loginStep2: async (username, sessionToken, mfaCode) => {
    const response = await api.post('/auth/login/step2', {
      username,
      session_token: sessionToken,
      mfa_code: mfaCode,
    });
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('sessionToken');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  // Get current user info
  getCurrentUser: () => {
    return {
      username: localStorage.getItem('username'),
      role: localStorage.getItem('userRole'),
      token: localStorage.getItem('accessToken'),
    };
  },
};

export default authService;
