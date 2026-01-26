import api from './api';

const securityService = {
  // Get root system status
  getSystemStatus: async () => {
    const response = await api.get('/');
    return response.data;
  },

  // Get comprehensive security verification
  getSecurityVerification: async () => {
    const response = await api.get('/verify-security');
    return response.data;
  },

  // Get security levels and risks theory
  getSecurityLevelsRisks: async () => {
    const response = await api.get('/security-levels-risks');
    return response.data;
  },

  // Get possible attacks theory
  getPossibleAttacks: async () => {
    const response = await api.get('/possible-attacks');
    return response.data;
  },
};

export default securityService;
