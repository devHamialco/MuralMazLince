import React from 'react';
import PropTypes from 'prop-types';
import { FaStar } from 'react-icons/fa';

/**
 * StarRating — Componente de valoración accesible de 1 a 3 estrellas.
 *
 * Mejoras aplicadas:
 * 1. Soporte completo de navegación por teclado en WAI-ARIA (flechas/Home/End).
 * 2. Semántica correcta de radiogroup con role="radio" y aria-checked={value === i}.
 * 3. Targets táctiles mínimos de 44x44px en modo interactivo.
 * 4. Modo de lectura con role="img" y descripción precisa.
 */
export default function StarRating({
  value = 0,
  onChange = null,
  readonly = false,
  size = 16,
}) {
  const handleClick = (e, rating) => {
    e.preventDefault();
    e.stopPropagation();
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleKeyDown = (e) => {
    if (readonly || !onChange) return;

    const current = Math.round(value) || 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(3, current + 1);
      onChange(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const prev = Math.max(1, current - 1);
      onChange(prev);
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(1);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(3);
    }
  };

  const getStars = () => {
    const stars = [];
    const displayValue = Math.round(value);

    for (let i = 1; i <= 3; i += 1) {
      const isFilled = i <= displayValue;

      if (readonly) {
        stars.push(
          <FaStar
            key={i}
            aria-hidden="true"
            style={{
              fontSize: `${size}px`,
              color: isFilled ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'color var(--transition-fast)',
            }}
          />,
        );
      } else {
        const isCurrent = Math.round(value) === i;
        stars.push(
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={isCurrent}
            tabIndex={isCurrent || (value === 0 && i === 1) ? 0 : -1}
            onClick={(e) => handleClick(e, i)}
            style={{
              background: 'none',
              border: 'none',
              minWidth: '44px',
              minHeight: '44px',
              padding: 0,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
              transition: 'transform var(--transition-fast)',
            }}
            aria-label={`${i} de 3 estrella${i > 1 ? 's' : ''}`}
          >
            <FaStar
              aria-hidden="true"
              style={{
                fontSize: `${Math.max(20, size)}px`,
                color: isFilled ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'color var(--transition-fast)',
              }}
            />
          </button>,
        );
      }
    }

    return stars;
  };

  if (readonly) {
    const formatted = Number(value || 0).toFixed(1);
    return (
      <div
        className="d-inline-flex align-items-center"
        style={{ gap: '4px' }}
        role="img"
        aria-label={`Valoración: ${formatted} de 3 estrellas`}
      >
        {getStars()}
      </div>
    );
  }

  return (
    <div
      className="d-inline-flex align-items-center"
      style={{ gap: '2px' }}
      role="radiogroup"
      aria-label="Calificación de 1 a 3 estrellas"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
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
