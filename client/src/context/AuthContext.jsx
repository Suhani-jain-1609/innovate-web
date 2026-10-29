import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('staffsync_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('staffsync_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const storedToken = localStorage.getItem('staffsync_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('staffsync_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Session expired or invalid token', err);
          logout();
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;

      setToken(receivedToken);
      setUser(receivedUser);

      localStorage.setItem('staffsync_token', receivedToken);
      localStorage.setItem('staffsync_user', JSON.stringify(receivedUser));

      return { success: true, user: receivedUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const { token: receivedToken, user: receivedUser } = res.data;

      setToken(receivedToken);
      setUser(receivedUser);

      localStorage.setItem('staffsync_token', receivedToken);
      localStorage.setItem('staffsync_user', JSON.stringify(receivedUser));

      return { success: true, user: receivedUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('staffsync_token');
    localStorage.removeItem('staffsync_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('staffsync_user', JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      updateUser(res.data.user);
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

