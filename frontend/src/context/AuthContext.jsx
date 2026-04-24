/**
 * @fileoverview AuthContext — Gestión de sesión de usuario (T15, implementacion-11.md)
 *
 * Responsabilidad: mantener el estado de autenticación a lo largo de toda
 * la aplicación. La sesión se basa en cookies HttpOnly gestionadas por el
 * backend; el frontend nunca accede ni almacena el token directamente.
 *
 * Roles reconocidos (SAD §4.1, RN-01):
 *   - visitor_registered  (ROL-01)
 *   - entrepreneur        (ROL-02 / ROL-03)
 *   - admin               (ROL-04)
 *
 * Referencia: DDC, wireframes-spec.md, SRS RF-01 a RF-07
 */

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Verifica si existe una sesión activa consultando `/auth/me`.
   * Si la cookie HttpOnly es válida, establece `user` con los datos del perfil.
   * En caso de error (cookie expirada o ausente) limpia el estado.
   *
   * @returns {Promise<void>}
   */
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

  /**
   * Inicia sesión con matrícula y contraseña opcional (ROL-01 no usa contraseña).
   * El backend establece la cookie HttpOnly en su respuesta.
   *
   * @param {string}      matricula - Matrícula universitaria de 8 caracteres.
   * @param {string|null} [password] - Contraseña. Requerida para emprendedor y admin.
   * @returns {Promise<object>} Objeto `user` del backend con id, role y display_name.
   * @throws {Error} Si las credenciales son inválidas o la cuenta está suspendida.
   */
  const login = async (matricula, password = null) => {
    const response = await api.login(matricula, password);
    setUser(response.data.user);
    return response.data.user;
  };

  /**
   * Registra un estudiante (ROL-01) usando solo su matrícula.
   * No establece sesión automáticamente; el usuario debe hacer login.
   *
   * @param {string} matricula - Matrícula universitaria válida (checksum aprobado).
   * @returns {Promise<object>} Datos de la respuesta del backend.
   * @throws {Error} Si la matrícula ya existe (HTTP 409) o el checksum falla (HTTP 400).
   */
  const registerStudent = async (matricula) => {
    const response = await api.registerStudent(matricula);
    return response.data;
  };

  /**
   * Registra un emprendedor (ROL-02/ROL-03) y establece sesión si la creación es exitosa.
   *
   * @param {object} data
   * @param {string} data.matricula     - Matrícula universitaria válida.
   * @param {string} data.password      - Contraseña que cumple la política del backend.
   * @param {string} data.display_name  - Nombre público visible en el feed (sin bad-words).
   * @param {string} data.whatsapp      - Número de WhatsApp; no se expone al visitante.
   * @param {boolean} data.privacy_accepted - Debe ser `true` para completar el registro.
   * @returns {Promise<object>} Datos del usuario recién creado.
   * @throws {Error} Si la matrícula ya existe, el display_name es inapropiado o falta algún campo.
   */
  const registerEntrepreneur = async (data) => {
    const response = await api.registerEntrepreneur(data);
    if (response.status === 201) {
      setUser(response.data.user);
    }
    return response.data;
  };

  /**
   * Cierra la sesión actual. El backend invalida la cookie HttpOnly.
   * Tras el logout el contexto queda con `user = null` e `isAuthenticated = false`.
   *
   * @returns {Promise<void>}
   */
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

/**
 * Hook que expone el contexto de autenticación.
 * Debe usarse dentro de un árbol envuelto por `<AuthProvider>`.
 *
 * @returns {{ user: object|null, loading: boolean, isAuthenticated: boolean,
 *             role: string|null, login: Function, registerStudent: Function,
 *             registerEntrepreneur: Function, logout: Function, checkAuth: Function }}
 * @throws {Error} Si se usa fuera del árbol de `AuthProvider`.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}