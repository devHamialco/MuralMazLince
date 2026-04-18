/* LikeButton - wireframes-spec.md WF-3.3.1 */
/* Referencia: DDC 2.5, wireframes-spec.md */

import PropTypes from 'prop-types';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

export default function LikeButton({ 
  liked = false, 
  count = 0, 
  onClick, 
  disabled = false,
  size = 20,
}) {
  const handleClick = (e) => {
    e.stopPropagation();
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      className="d-inline-flex align-items-center gap-1"
      onClick={handleClick}
      disabled={disabled}
      aria-label={liked ? 'Quitar like' : 'Dar like'}
      aria-pressed={liked}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: 'transparent',
        border: 'none',
        padding: '4px',
        cursor: disabled ? 'pointer' : 'pointer',
        color: liked ? 'var(--primary)' : 'var(--text-muted)',
        transition: 'transform var(--transition-fast)',
        borderRadius: '4px',
      }}
      title={disabled ? 'Regístrate para valorar' : undefined}
    >
      <span
        style={{
          display: 'inline-flex',
          fontSize: `${size}px`,
        }}
        className={liked ? 'pop-animation' : ''}
      >
        {liked ? <FaHeart /> : <FaRegHeart />}
      </span>
      {count !== undefined && (
        <span style={{ fontSize: '12px', color: 'inherit' }}>
          {count}
        </span>
      )}
    </button>
  );
}

LikeButton.propTypes = {
  liked: PropTypes.bool,
  count: PropTypes.number,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  size: PropTypes.number,
};