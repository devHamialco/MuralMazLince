import { useEffect, useState } from 'react';
import { FaCheck, FaTimes, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext';

const icons = {
  success: FaCheck,
  error: FaTimes,
  warning: FaExclamationTriangle,
  info: FaInfoCircle,
};

const colors = {
  success: 'var(--success)',
  error: 'var(--error)',
  warning: 'var(--warning)',
  info: 'var(--info)',
};

export default function ToastNotification() {
  const { toast } = useNotification();
  const [visible, setVisible] = useState(false);
  const [currentToast, setCurrentToast] = useState(null);

  useEffect(() => {
    if (toast && !visible) {
      setCurrentToast(toast);
      setVisible(true);
      
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => setCurrentToast(null), 300);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!currentToast) return null;

  const Icon = icons[currentToast.type] || icons.info;
  const color = colors[currentToast.type] || colors.info;

  return (
    <div 
      className={`toast-notification position-fixed ${visible ? 'show' : 'hide'}`}
      style={{
        bottom: '24px',
        right: '24px',
        zIndex: 'var(--z-toast)',
        backgroundColor: 'var(--bg-elevated)',
        border: `1px solid ${color}`,
        borderRadius: 'var(--border-radius-md)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: 'var(--shadow-lg)',
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.3s ease',
        maxWidth: '350px',
      }}
      role="alert"
      aria-live="polite"
    >
      <Icon color={color} size={20} />
      <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
        {currentToast.message}
      </span>
    </div>
  );
}