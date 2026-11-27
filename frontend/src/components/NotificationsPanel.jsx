import React from 'react';
import PropTypes from 'prop-types';
import {
  FiAlertTriangle,
  FiBell,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiCheck,
} from 'react-icons/fi';
import EmptyState from './EmptyState';

const getNotificationMeta = (type) => {
  switch (type) {
    case 'approved':
      return {
        icon: <FiCheckCircle aria-hidden="true" />,
        bg: 'rgba(16, 185, 129, 0.15)',
        color: 'var(--status-active)',
      };
    case 'review':
    case 'pending':
      return {
        icon: <FiClock aria-hidden="true" />,
        bg: 'rgba(245, 158, 11, 0.15)',
        color: 'var(--status-pending)',
      };
    case 'warning':
    case 'rejected':
      return {
        icon: <FiAlertCircle aria-hidden="true" />,
        bg: 'rgba(239, 68, 68, 0.15)',
        color: 'var(--status-rejected)',
      };
    default:
      return {
        icon: <FiBell aria-hidden="true" />,
        bg: 'rgba(255, 255, 255, 0.08)',
        color: 'var(--text-secondary)',
      };
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * NotificationsPanel — Bandeja móvil accesible para notificaciones de la plataforma.
 *
 * Mejoras aplicadas:
 * 1. Indicador accesible de no leída con texto oculto para lectores de pantalla.
 * 2. Formato de fecha ajustado a es-MX y copy unificado a tuteo neutro mexicano.
 * 3. Botón "Marcar todas como leídas" con target táctil mínimo de 44px.
 * 4. Foco e interactividad accesible en cada renglón de notificación.
 */
export default function NotificationsPanel({
  notifications,
  unreadCount,
  loading,
  error = null,
  onMarkAsRead,
  onMarkAllAsRead,
  onRetry,
}) {
  return (
    <div className="notifications-shell">
      <div className="notifications-header">
        <div className="d-flex align-items-center gap-2">
          <h2 className="section-title">Notificaciones</h2>
          {unreadCount > 0 && (
            <span
              className="badge"
              style={{
                backgroundColor: 'var(--primary)',
                color: '#fff',
                fontSize: '12px',
                borderRadius: '10px',
                padding: '4px 8px',
              }}
            >
              {unreadCount} nuevas
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="btn-project-status"
            onClick={onMarkAllAsRead}
            style={{ minHeight: '44px', padding: '0 14px' }}
            aria-label="Marcar todas las notificaciones como leídas"
          >
            <FiCheck aria-hidden="true" />
            <span>Marcar todas como leídas</span>
          </button>
        )}
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border" role="status" style={{ color: 'var(--primary)' }}>
            <span className="visually-hidden">Cargando notificaciones…</span>
          </div>
        </div>
      )}

      {!loading && error && (
        <EmptyState
          variant="error"
          icon={FiAlertTriangle}
          title="No pudimos cargar tus notificaciones"
          subtitle="Revisa tu conexión a internet e intenta nuevamente."
          actionLabel="Reintentar"
          onAction={onRetry}
        />
      )}

      {!loading && !error && notifications.length === 0 && (
        <EmptyState
          icon={FiBell}
          title="Bandeja al día"
          subtitle="Aquí recibirás avisos sobre la aprobación, estado y vencimiento de tus anuncios."
        />
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="notifications-list" role="feed" aria-label="Notificaciones del usuario">
          {notifications.map((notif) => {
            const isRead = Boolean(notif.is_read);
            const meta = getNotificationMeta(notif.type);

            return (
              <button
                key={notif.id}
                type="button"
                className={`notification-row-item ${!isRead ? 'unread' : ''}`}
                onClick={() => {
                  if (!isRead) onMarkAsRead(notif.id);
                }}
                aria-label={`Notificación: ${notif.message}. Fecha: ${formatDate(notif.created_at)} (${isRead ? 'leída' : 'no leída'})`}
                style={{ minHeight: '44px' }}
              >
                <div
                  className="notif-type-icon"
                  style={{ backgroundColor: meta.bg, color: meta.color }}
                  aria-hidden="true"
                >
                  {meta.icon}
                </div>

                <div className="notif-body">
                  <p className="notif-message-text">{notif.message}</p>
                  <span className="notif-date-stamp">{formatDate(notif.created_at)}</span>
                </div>

                {!isRead && (
                  <>
                    <span className="notif-unread-dot" aria-hidden="true" />
                    <span className="visually-hidden">No leída</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

NotificationsPanel.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      type: PropTypes.string,
      message: PropTypes.string,
      is_read: PropTypes.bool,
      created_at: PropTypes.string,
    }),
  ).isRequired,
  unreadCount: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onMarkAsRead: PropTypes.func.isRequired,
  onMarkAllAsRead: PropTypes.func.isRequired,
  onRetry: PropTypes.func.isRequired,
};
