import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (matricula, password = null) => {
    const payload = password 
      ? { matricula, password }
      : { matricula };
    const response = await api.post('/auth/login', payload);
    const { user: userData, token } = response.data;
    setUser(userData);
    return userData;
  };

  const registerStudent = async (matricula) => {
    const response = await api.post('/auth/register/student', { matricula });
    return response.data;
  };

  const registerEntrepreneur = async (data) => {
    const response = await api.post('/auth/register/entrepreneur', data);
    return response.data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    registerStudent,
    registerEntrepreneur,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}