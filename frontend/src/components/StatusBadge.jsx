/* StatusBadge - wireframes-spec.md */
/* Referencia: DDC 2.5, wireframes-spec.md */

import PropTypes from 'prop-types';

const statusConfig = {
  active: {
    label: 'Publicado',
    color: 'var(--status-active)',
    bgColor: 'rgba(72, 187, 120, 0.15)',
  },
  pending_review: {
    label: 'En revisión',
    color: 'var(--status-pending)',
    bgColor: 'rgba(240, 192, 64, 0.15)',
  },
  pending: {
    label: 'En revisión',
    color: 'var(--status-pending)',
    bgColor: 'rgba(240, 192, 64, 0.15)',
  },
  rejected: {
    label: 'Rechazado',
    color: 'var(--status-rejected)',
    bgColor: 'rgba(229, 62, 62, 0.15)',
  },
  shadowban: {
    label: 'Oculto',
    color: 'var(--primary)',
    bgColor: 'rgba(196, 24, 74, 0.15)',
  },
  expired: {
    label: 'Expirado',
    color: 'var(--text-muted)',
    bgColor: 'rgba(113, 128, 150, 0.15)',
  },
  suspended: {
    label: 'Suspendido',
    color: 'var(--text-muted)',
    bgColor: 'rgba(113, 128, 150, 0.15)',
  },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.active;
  
  return (
    <span
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        fontSize: '12px',
        fontWeight: 600,
        padding: '3px 8px',
        borderRadius: 'var(--radius-sm)',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {config.label}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};