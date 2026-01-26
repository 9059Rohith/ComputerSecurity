import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on mount
    const checkAuth = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser.token) {
        setUser(currentUser);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (accessToken, username, role) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('username', username);
    localStorage.setItem('userRole', role);
    setUser({ username, role, token: accessToken });
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
