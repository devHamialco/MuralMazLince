import PropTypes from 'prop-types';

const statusConfig = {
  active: {
    label: 'Activo',
    color: 'var(--status-active)',
    bgColor: 'rgba(76, 175, 80, 0.15)',
  },
  pending_review: {
    label: 'Pendiente',
    color: 'var(--status-pending)',
    bgColor: 'rgba(255, 152, 0, 0.15)',
  },
  rejected: {
    label: 'Rechazado',
    color: 'var(--status-rejected)',
    bgColor: 'rgba(244, 67, 54, 0.15)',
  },
  shadowban: {
    label: 'Oculto',
    color: 'var(--status-shadowban)',
    bgColor: 'rgba(158, 158, 158, 0.15)',
  },
  expired: {
    label: 'Vencido',
    color: 'var(--status-expired)',
    bgColor: 'rgba(117, 117, 117, 0.15)',
  },
  suspended: {
    label: 'Suspendido',
    color: 'var(--status-rejected)',
    bgColor: 'rgba(244, 67, 54, 0.15)',
  },
};

export default function StatusBadge({ status, size = 'md' }) {
  const config = statusConfig[status] || statusConfig.active;
  
  const sizes = {
    sm: { fontSize: '0.7rem', padding: '2px 6px' },
    md: { fontSize: '0.75rem', padding: '4px 8px' },
    lg: { fontSize: '0.85rem', padding: '6px 12px' },
  };

  return (
    <span
      className="status-badge"
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        border: `1px solid ${config.color}40`,
        borderRadius: 'var(--border-radius-sm)',
        fontWeight: 600,
        fontSize: sizes[size].fontSize,
        padding: sizes[size].padding,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      <span 
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.color,
        }} 
      />
      {config.label}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};