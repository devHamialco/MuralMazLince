/* StarRating - wireframes-spec.md WF-3.3.1 */
/* Referencia: DDC 2.5, wireframes-spec.md */

import PropTypes from 'prop-types';
import { FaStar } from 'react-icons/fa';

export default function StarRating({ 
  value = 0, 
  onChange, 
  readonly = false,
  size = 16,
}) {
  const handleClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const getStars = () => {
    const stars = [];
    const displayValue = Math.round(value);
    
    for (let i = 1; i <= 3; i++) {
      const isFilled = i <= displayValue;
      
      if (readonly) {
        stars.push(
          <FaStar
            key={i}
            style={{
              fontSize: `${size}px`,
              color: isFilled ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'color var(--transition-fast)',
            }}
          />
        );
      } else {
        stars.push(
          <button
            key={i}
            onClick={() => handleClick(i)}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              cursor: 'pointer',
              display: 'flex',
              transition: 'transform var(--transition-fast)',
            }}
            aria-label={`${i} estrella${i > 1 ? 's' : ''}`}
            aria-pressed={value >= i}
          >
            <FaStar
              style={{
                fontSize: `${size}px`,
                color: i <= value ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'color var(--transition-fast)',
              }}
            />
          </button>
        );
      }
    }
    
    return stars;
  };

  return (
    <div
      className="d-inline-flex align-items-center"
      style={{ gap: '4px' }}
      role={readonly ? 'img' : 'radiogroup'}
      aria-label={readonly ? `Valoración: ${value} de 3 estrellas` : 'Selecciona una valoración'}
    >
      {getStars()}
    </div>
  );
}

StarRating.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func,
  readonly: PropTypes.bool,
  size: PropTypes.number,
};