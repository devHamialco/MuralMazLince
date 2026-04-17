import PropTypes from 'prop-types';
import { FaStar } from 'react-icons/fa';

export default function StarRating({ value, onChange, readonly = false, size = 'md' }) {
  const sizes = {
    sm: 'fa-sm',
    md: '',
    lg: 'fa-lg',
  };

  const handleClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleKeyDown = (e, rating) => {
    if (!readonly && onChange && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onChange(rating);
    }
  };

  return (
    <div 
      className={`star-rating d-inline-flex align-items-center gap-1 ${readonly ? 'readonly' : ''}`}
      role={readonly ? 'img' : 'radiogroup'}
      aria-label={readonly ? `Valoración: ${value} de 3 estrellas` : 'Selecciona una valoración'}
    >
      {[1, 2, 3].map((star) => (
        <FaStar
          key={star}
          className={`${sizes[size]} ${star <= value ? 'text-warning' : 'text-muted'} ${!readonly ? 'cursor-pointer' : ''}`}
          onClick={() => handleClick(star)}
          onKeyDown={(e) => handleKeyDown(e, star)}
          role={readonly ? undefined : 'radio'}
          aria-checked={readonly ? undefined : value === star}
          aria-disabled={readonly}
          tabIndex={readonly ? -1 : 0}
          style={{ cursor: readonly ? 'default' : 'pointer', transition: 'color 0.15s ease' }}
        />
      ))}
    </div>
  );
}

StarRating.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func,
  readonly: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};