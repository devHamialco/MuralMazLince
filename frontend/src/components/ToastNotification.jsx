/* ToastNotification - wireframes-spec.md */
/* Referencia: DDC 2.5, wireframes-spec.md */

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FiCheck, FiX, FiAlertCircle, FiInfo } from 'react-icons/fi';

const TOAST_TYPES = {
  success: {
    icon: FiCheck,
    bgColor: 'var(--status-active)',
    color: 'var(--text-primary)',
  },
  error: {
    icon: FiX,
    bgColor: 'var(--status-rejected)',
    color: 'var(--text-primary)',
  },
  info: {
    icon: FiInfo,
    bgColor: 'var(--secondary)',
    color: 'var(--text-primary)',
  },
  warning: {
    icon: FiAlertCircle,
    bgColor: 'var(--status-pending)',
    color: '#1A1A2E',
  },
};

export default function ToastNotification({ toast = null, onClose = null }) {
  const [visible, setVisible] = useState(false);
  const [currentToast, setCurrentToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;

    setCurrentToast(toast);
    setVisible(true);

    const duration = toast.type === 'warning' ? 4000 : 2000;
    let exitTimer;
    const dismissTimer = setTimeout(() => {
      setVisible(false);
      exitTimer = setTimeout(() => {
        setCurrentToast(null);
        onClose?.();
      }, 200);
    }, duration);

    return () => {
      clearTimeout(dismissTimer);
      clearTimeout(exitTimer);
    };
  }, [toast, onClose]);

  if (!currentToast) return null;

  const config = TOAST_TYPES[currentToast.type] || TOAST_TYPES.info;
  const Icon = config.icon;

  return (
    <div
      style={{
        position: 'fixed',
        top: 'var(--spacing-md)',
        left: 'var(--spacing-md)',
        right: 'var(--spacing-md)',
        zIndex: 500,
        backgroundColor: config.bgColor,
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: 'var(--shadow-modal)',
        transform: visible ? 'translateY(0)' : 'translateY(-20px)',
        opacity: visible ? 1 : 0,
        transition: 'all 200ms ease',
        maxWidth: '343px',
        margin: '0 auto',
      }}
      role="alert"
      aria-live="polite"
    >
      <Icon size={20} style={{ color: config.color, flexShrink: 0 }} />
      <span style={{ color: config.color, fontSize: '14px', flex: 1 }}>
        {currentToast.message}
      </span>
    </div>
  );
}

ToastNotification.propTypes = {
  toast: PropTypes.shape({
    type: PropTypes.oneOf(['success', 'error', 'info', 'warning']),
    message: PropTypes.string.isRequired,
  }),
  onClose: PropTypes.func,
};
