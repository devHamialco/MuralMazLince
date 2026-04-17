import PropTypes from 'prop-types';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

export default function LikeButton({ liked, count, onToggle, disabled = false, size = 'md' }) {
  const sizes = {
    sm: { icon: 'fa-sm', font: 'fs-6' },
    md: { icon: '', font: 'fs-5' },
    lg: { icon: 'fa-lg', font: 'fs-4' },
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (!disabled && onToggle) {
      onToggle();
    }
  };

  const handleKeyDown = (e) => {
    if (!disabled && onToggle && (e.key === 'Enter' || e.key === 'Space')) {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <button
      className={`like-button btn btn-link d-inline-flex align-items-center gap-1 p-0 ${liked ? 'liked' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={liked ? 'Quitar like' : 'Dar like'}
      aria-pressed={liked}
      style={{ 
        color: liked ? 'var(--error)' : 'var(--text-muted)',
        textDecoration: 'none',
        transition: 'transform 0.15s ease, color 0.15s ease',
        border: 'none',
        background: 'transparent',
      }}
    >
      <span 
        className={`like-icon ${sizes[size].icon}`}
        style={{ 
          display: 'inline-flex',
          transform: liked ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.15s ease',
        }}
      >
        {liked ? <FaHeart /> : <FaRegHeart />}
      </span>
      {count !== undefined && (
        <span className={`count ${sizes[size].font}`} style={{ color: 'inherit' }}>
          {count}
        </span>
      )}
    </button>
  );
}

LikeButton.propTypes = {
  liked: PropTypes.bool.isRequired,
  count: PropTypes.number,
  onToggle: PropTypes.func,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};