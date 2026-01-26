import api from './api';

const userService = {
  // Register RSA public key for user
  registerPublicKey: async (username, publicKey) => {
    const response = await api.post('/users/register-key', {
      username,
      public_key: publicKey,
    });
    return response.data;
  },

  // Verify user registration and security setup
  verifyUser: async (username) => {
    const response = await api.get(`/users/verify/${username}`);
    return response.data;
  },
};

export default userService;
