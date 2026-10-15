/**
 * @fileoverview NotificationContext — Toast y notificaciones en memoria (T15, implementacion-11.md)
 *
 * Gestiona dos capas de notificaciones:
 *   1. Toast efímero: mensaje flotante con auto-dismiss configurable.
 *   2. Notificaciones de usuario: lista en memoria sincronizada con la API
 *      (tipos: approved, rejected, pending, expiring_soon, shadowban).
 *
 * No persiste en localStorage. El estado se sincroniza desde la API
 * cuando el panel de notificaciones se monta (RF-25).
 *
 * Referencia: SRS RF-25, SAD COMP-10, wireframes-spec WF-3.4.4
 */
import { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';
import logger from '../utils/logger';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);

  /**
   * Muestra un toast; ToastNotification controla su cierre automático.
   *
   * @param {string} message - Texto visible al usuario.
   * @param {'info'|'success'|'warning'|'error'} [type='info'] - Tipo semántico del toast.
   * @returns {void}
   */
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  /**
   * Agrega una notificación al inicio de la lista e incrementa `unreadCount`.
   * Usar cuando el backend emite una notificación nueva que aún no está en el estado.
   *
   * @param {{ id: number, type: string, message: string, is_read: boolean, created_at: string }} notification
   * @returns {void}
   */
  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  /**
   * Marca una notificación específica como leída localmente.
   * Debe llamarse después de que la API confirme el PATCH.
   *
   * @param {number} id - ID de la notificación.
   * @returns {void}
   */
  const markAsRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  /**
   * Marca todas las notificaciones como leídas y resetea `unreadCount` a 0.
   * Debe llamarse después de que la API confirme el PATCH /notifications/read-all.
   *
   * @returns {void}
   */
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  /**
   * Vacía la lista de notificaciones y resetea el contador.
   * Útil al cerrar sesión para evitar que datos de un usuario
   * queden visibles para el siguiente.
   *
   * @returns {void}
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  /**
   * Carga las notificaciones desde la API y actualiza el estado.
   * Debe llamarse al montar el panel de notificaciones o al iniciar sesión.
   *
   * @returns {Promise<void>}
   */
  const loadNotifications = useCallback(async () => {
    try {
      const response = await api.getNotifications();
      const notifs = response.data.notifications || [];
      setNotifications(notifs);
      const unread = notifs.filter((n) => !n.is_read && !n.read).length;
      setUnreadCount(unread);
      logger.api('GET', '/notifications', 'Loaded', notifs.length, 'notifications');
    } catch (err) {
      logger.error('Failed to load notifications:', err.message);
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    toast,
    showToast,
    hideToast,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    loadNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook que expone el contexto de notificaciones.
 * Debe usarse dentro de un árbol envuelto por `<NotificationProvider>`.
 *
 * @returns {{ notifications: Array, unreadCount: number, toast: object|null,
 *             showToast: Function, addNotification: Function, markAsRead: Function,
 *             markAllAsRead: Function, clearNotifications: Function, loadNotifications: Function }}
 * @throws {Error} Si se usa fuera del árbol de `NotificationProvider`.
 */
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
