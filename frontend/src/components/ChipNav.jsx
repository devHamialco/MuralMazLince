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
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--spacing-sm)',
        flexWrap: 'wrap',
        padding: 'var(--spacing-sm) 0',
      }}
    >
      {options.map(({ label, value }) => {
        const isActive = activeValue === value;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
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
