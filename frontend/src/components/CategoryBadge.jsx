/* CategoryBadge - wireframes-spec.md */
/* Referencia: DDC 2.5, wireframes-spec.md */

import PropTypes from 'prop-types';
import { CATEGORY_GROUPS, GROUP_COLORS } from '../constants/categories';

export default function CategoryBadge({
  category,
  selected = false,
  clickable = false,
  onClick = null,
}) {
  const group = CATEGORY_GROUPS[category] || 'otro';
  const color = GROUP_COLORS[group] || GROUP_COLORS.otro;

  const handleClick = (e) => {
    if (clickable && onClick) {
      e.stopPropagation();
      onClick(category);
    }
  };

  const Element = clickable ? 'button' : 'span';

  // Modo badge estático (sobre tarjetas, sin interacción)
  if (!clickable) {
    return (
      <span
        className="category-badge"
        style={{
          backgroundColor: `${color}22`,
          color,
          fontSize: '11px',
          fontWeight: 600,
          padding: '3px 8px',
          borderRadius: 'var(--radius-sm)',
          display: 'inline-flex',
          alignItems: 'center',
          letterSpacing: '0.02em',
        }}
      >
        <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {category?.substring(0, 20) || 'Categoría'}
        </span>
      </span>
    );
  }

  // Modo chip filtrable (barra de categorías en el feed)
  return (
    <Element
      className="category-badge"
      onClick={handleClick}
      type="button"
      aria-label={`Filtrar por categoría: ${category}`}
      aria-pressed={selected}
      style={{
        backgroundColor: selected ? color : 'var(--bg-surface)',
        color: selected ? '#fff' : color,
        border: `1.5px solid ${selected ? color : `${color}55`}`,
        fontSize: '13px',
        fontWeight: selected ? 700 : 600,
        padding: '6px 14px',
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        transition: 'all 200ms ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        boxShadow: selected ? `0 2px 8px ${color}44` : 'none',
        transform: selected ? 'scale(1.02)' : 'scale(1)',
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {category?.substring(0, 22) || 'Categoría'}
      </span>
    </Element>
  );
}

CategoryBadge.propTypes = {
  category: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
};
