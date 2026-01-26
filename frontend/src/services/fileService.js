import api from './api';

const fileService = {
  // Upload file with encryption
  uploadFile: async (file, ownerUsername, expiryMinutes = 60, userRole = 'Admin') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('owner_username', ownerUsername);
    formData.append('expiry_minutes', expiryMinutes);
    formData.append('user_role', userRole);

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Download file (requires role-based access)
  downloadFile: async (fileId, userRole) => {
    const response = await api.post(`/files/download/${fileId}`, {
      user_role: userRole,
    });
    return response.data;
  },

  // List all files
  listFiles: async () => {
    const response = await api.get('/files/list');
    return response.data;
  },

  // Delete file (Admin only)
  deleteFile: async (fileId, userRole) => {
    const response = await api.delete(`/files/delete/${fileId}?user_role=${userRole}`);
    return response.data;
  },
};

export default fileService;
