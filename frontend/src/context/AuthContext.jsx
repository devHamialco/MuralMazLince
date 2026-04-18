/* AuthContext - Sistema de autenticación */
/* Referencia: DDC, wireframes-spec.md */

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
      const response = await api.getMe();
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (matricula, password = null) => {
    const response = await api.login(matricula, password);
    setUser(response.data.user);
    return response.data.user;
  };

  const registerStudent = async (matricula) => {
    const response = await api.registerStudent(matricula);
    return response.data;
  };

  const registerEntrepreneur = async (data) => {
    const response = await api.registerEntrepreneur(data);
    if (response.status === 201) {
      setUser(response.data.user);
    }
    return response.data;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    role: user?.role || null,
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