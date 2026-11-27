/* CategoryBadge — Badge semántico y chip de filtrado por categoría
 *
 * Mejoras aplicadas:
 * 1. Altura táctil accesible: min-height: 44px en modo interactivo/clickable (WCAG 2.5.5).
 * 2. Color seguro y alto contraste: Reemplazo de concatenaciones hex frágiles (`color + '33'`)
 *    por `color-mix()` y tokens de diseño.
 * 3. Soporte para scroll-snap en barras de filtro horizontales (`scrollSnapAlign: 'start'`).
 * 4. Eliminación de defaultProps obsoletos, usando parámetros por defecto.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  CATEGORY_DISPLAY_LABELS,
  CATEGORY_GROUPS,
  GROUP_COLORS,
  normalizeCategory,
} from '../constants/categories';

export default function CategoryBadge({
  category,
  selected = false,
  clickable = false,
  onClick = null,
}) {
  const normalized = normalizeCategory(category);
  const group = CATEGORY_GROUPS[normalized] || 'otro';
  const color = GROUP_COLORS[group] || 'var(--primary)';
  const label = CATEGORY_DISPLAY_LABELS[normalized] || normalized;

  const handleClick = (e) => {
    if (clickable && onClick) {
      e.stopPropagation();
      onClick(normalized);
    }
  };

  // Modo badge estático (sobre tarjetas de anuncio o proyecto)
  if (!clickable) {
    return (
      <span
        className="category-badge"
        style={{
          backgroundColor: `color-mix(in srgb, ${color} 18%, var(--bg-surface))`,
          border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
          color: '#FFFFFF',
          fontSize: '12px',
          fontWeight: 600,
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          display: 'inline-flex',
          alignItems: 'center',
          letterSpacing: '0.02em',
          userSelect: 'none',
        }}
      >
        <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      </span>
    );
  }

  // Modo chip filtrable interactivo (para barra horizontal en Feed)
  return (
    <button
      className="category-badge category-badge-interactive"
      onClick={handleClick}
      type="button"
      aria-label={`Filtrar por categoría: ${category}`}
      aria-pressed={selected}
      style={{
        minHeight: '44px',
        padding: '0 16px',
        backgroundColor: selected ? color : 'var(--bg-card)',
        color: selected ? '#FFFFFF' : 'var(--text-secondary)',
        border: selected ? '1.5px solid transparent' : '1.5px solid var(--border)',
        fontSize: '14px',
        fontWeight: selected ? 700 : 500,
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        boxShadow: selected ? 'var(--shadow-button)' : 'none',
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        scrollSnapAlign: 'start',
        flexShrink: 0,
      }}
    >
      <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </button>
  );
}

CategoryBadge.propTypes = {
  category: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
};
