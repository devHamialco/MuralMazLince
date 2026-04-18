/* NotificationDot - wireframes-spec.md WF-3.3.1 */
/* Referencia: DDC 2.5 */

import PropTypes from 'prop-types';

export default function NotificationDot({ count = 0, size = 'sm' }) {
  if (count <= 0) return null;
  
  const sizes = {
    sm: { width: '8px', height: '8px' },
    md: { width: '12px', height: '12px' },
    lg: { width: '16px', height: '16px' },
  };

  return (
    <span
      style={{
        position: 'absolute',
        top: '-2px',
        right: '-2px',
        width: sizes[size].width,
        height: sizes[size].height,
        backgroundColor: 'var(--status-rejected)',
        borderRadius: '50%',
        zIndex: 'var(--z-notification-dot)',
      }}
      aria-label={`${count} notificaciones sin leer`}
    />
  );
}

NotificationDot.propTypes = {
  count: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};