import React from 'react';
import PropTypes from 'prop-types';

/**
 * ChipNav — Barra de navegación horizontal por pestañas tipo chip/pills.
 * Soporta scroll táctil continuo en mobile y navegación por teclado (WAI-ARIA tabs).
 *
 * @param {object} props
 * @param {Array} props.options - Opciones [{ label, value, badge }]
 * @param {string} props.activeValue - Valor actualmente activo.
 * @param {Function} props.onChange - Callback `(value) => void` al seleccionar.
 */
export default function ChipNav({ options, activeValue, onChange }) {
  const handleKeyDown = (event, index) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();

    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % options.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + options.length) % options.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = options.length - 1;

    const tabs = event.currentTarget.parentElement.querySelectorAll('[role="tab"]');
    if (tabs[next]) {
      tabs[next].focus();
      onChange(options[next].value);
    }
  };

  return (
    <nav className="chip-nav-wrapper" aria-label="Secciones del panel">
      <div className="chip-nav-track" role="tablist">
        {options.map(({ label, value, badge }, index) => {
          const isActive = activeValue === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`chip-item-btn ${isActive ? 'active' : ''}`}
            >
              <span>{label}</span>
              {badge !== undefined && badge !== null && Number(badge) > 0 && (
                <span className="chip-badge-pill">{badge}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

ChipNav.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      badge: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
  ).isRequired,
  activeValue: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
