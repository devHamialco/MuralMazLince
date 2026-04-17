import PropTypes from 'prop-types';

export default function NotificationDot({ count, size = 'md', showZero = false }) {
  const shouldShow = count > 0 || (showZero && count === 0);
  
  if (!shouldShow) return null;

  const sizes = {
    sm: { width: '14px', height: '14px', fontSize: '0.65rem' },
    md: { width: '18px', height: '18px', fontSize: '0.75rem' },
    lg: { width: '22px', height: '22px', fontSize: '0.85rem' },
  };

  const displayCount = count > 99 ? '99+' : count;

  return (
    <span
      className="notification-dot position-absolute"
      style={{
        top: '-4px',
        right: '-4px',
        minWidth: sizes[size].width,
        height: sizes[size].height,
        backgroundColor: 'var(--error)',
        color: 'white',
        borderRadius: '10px',
        fontSize: sizes[size].fontSize,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 4px',
        border: '2px solid var(--bg-surface)',
        zIndex: 10,
      }}
      aria-label={`${count} notificaciones`}
    >
      {displayCount}
    </span>
  );
}

NotificationDot.propTypes = {
  count: PropTypes.number.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showZero: PropTypes.bool,
};