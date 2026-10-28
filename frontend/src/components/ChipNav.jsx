import React from 'react';
import PropTypes from 'prop-types';

/**
 * ChipNav — A chip-based navigation system for dashboard tabs.
 * Replaces legacy Bootstrap list-groups and nav-pills.
 *
 * @param {object} props
 * @param {Array}  props.options    - List of navigation options [{ label, value }]
 * @param {string} props.activeValue - The value of the currently active chip.
 * @param {Function} props.onChange  - Callback `(value) => void` when a chip is clicked.
 */
export default function ChipNav({ options, activeValue, onChange }) {
  // Navegación por flechas entre chips (APG tabs): Enter/Space ya activan
  // nativamente al ser <button>.
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
    if (tabs[next]) tabs[next].focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Secciones"
      style={{
        display: 'flex',
        gap: 'var(--spacing-sm)',
        flexWrap: 'wrap',
        padding: 'var(--spacing-sm) 0',
      }}
    >
      {options.map(({ label, value }, index) => {
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
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-elevated)',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: isActive ? 'var(--shadow-button)' : 'none',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

ChipNav.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }),
  ).isRequired,
  activeValue: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
