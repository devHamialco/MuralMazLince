import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FiSearch } from 'react-icons/fi';
import { CATEGORIES, getCategoryGroup, GROUP_COLORS } from '../constants/categories';

const VARIANTS = {
  productos: {
    name: 'Productos',
    categories: CATEGORIES.productos,
    color: GROUP_COLORS.productos || 'var(--primary)',
  },
  servicios: {
    name: 'Servicios',
    categories: CATEGORIES.servicios,
    color: GROUP_COLORS.servicios || 'var(--secondary)',
  },
};

export default function CategoryChipPanel({
  selectedCategory = '',
  onCategorySelect,
  setExpandedVariant = null,
  expandedVariant = null,
}) {
  const [internalExpanded, setInternalExpanded] = useState('productos');
  const [searchQuery, setSearchQuery] = useState('');

  // Detectar grupo de la categoría seleccionada para default activo
  const selectedGroup = useMemo(() => (
    selectedCategory ? getCategoryGroup(selectedCategory) : null
  ), [selectedCategory]);

  // Resolver variante activa (controlada por padre o interna)
  const activeVariant = useMemo(() => {
    if (expandedVariant !== null) return expandedVariant;
    if (selectedGroup && (selectedGroup === 'productos' || selectedGroup === 'servicios')) {
      return selectedGroup;
    }
    return internalExpanded;
  }, [expandedVariant, selectedGroup, internalExpanded]);

  const toggleVariant = (variantKey) => {
    const next = activeVariant === variantKey ? null : variantKey;
    if (setExpandedVariant) {
      setExpandedVariant(next);
    } else {
      setInternalExpanded(next);
    }
  };

  // Filtrado de categorías si hay búsqueda activa
  const visibleCategories = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const all = [...CATEGORIES.productos, ...CATEGORIES.servicios];
      return all.filter((cat) => cat.toLowerCase().includes(q));
    }
    if (!activeVariant || !VARIANTS[activeVariant]) return [];
    return VARIANTS[activeVariant].categories;
  }, [searchQuery, activeVariant]);

  return (
    <div className="category-chip-panel" style={{ width: '100%' }}>
      {/* Control Segmented/Tabs: Productos vs Servicios */}
      <div
        role="tablist"
        aria-label="Grupos de categorías"
        style={{
          display: 'flex',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          padding: '4px',
          gap: '4px',
          marginBottom: '10px',
          border: '1px solid var(--border)',
        }}
      >
        {Object.entries(VARIANTS).map(([key, data]) => {
          const isSelected = activeVariant === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => toggleVariant(key)}
              style={{
                flex: 1,
                minHeight: '44px',
                padding: '0 12px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isSelected ? data.color : 'transparent',
                color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>{data.name}</span>
            </button>
          );
        })}
      </div>

      {visibleCategories.length > 0 ? (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          {visibleCategories.map((category) => {
            const isSelected = category === selectedCategory;
            const groupName = getCategoryGroup(category);
            const groupColor = GROUP_COLORS[groupName] || 'var(--primary)';

            return (
              <button
                key={category}
                type="button"
                className="category-chip"
                onClick={() => onCategorySelect(category)}
                aria-pressed={isSelected}
                aria-label={`Categoría ${category}`}
                style={{
                  minHeight: '44px',
                  padding: '0 16px',
                  fontSize: '13px',
                  fontWeight: isSelected ? 700 : 500,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? groupColor : 'var(--bg-elevated)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                  border: isSelected ? '1.5px solid transparent' : '1px solid var(--border)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all var(--transition-fast)',
                  boxShadow: isSelected ? 'var(--shadow-button)' : 'none',
                }}
              >
                <span>{category}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <p
          style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '13px',
            padding: '16px 0',
          }}
        >
          No se encontraron categorías coincidentes.
        </p>
      )}
    </div>
  );
}

CategoryChipPanel.propTypes = {
  selectedCategory: PropTypes.string,
  onCategorySelect: PropTypes.func.isRequired,
  setExpandedVariant: PropTypes.func,
  expandedVariant: PropTypes.oneOf(['productos', 'servicios', null]),
};
