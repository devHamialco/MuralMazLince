/* CategoryBadge - wireframes-spec.md */
/* Referencia: DDC 2.5, wireframes-spec.md */

import PropTypes from 'prop-types';

const categoryGroups = {
  // Productos físicos
  'Alimentos y bebidas': 'productos',
  'Repostería y postres': 'productos',
  'Artesanías y manualidades': 'productos',
  'Ropa y accesorios': 'productos',
  'Papelería y material escolar': 'productos',
  'Cosméticos y cuidado personal': 'productos',
  'Plantas y decoración': 'productos',
  // Servicios
  'Asesorías académicas y tutorías': 'servicios',
  'Diseño gráfico y digital': 'servicios',
  'Fotografía y video': 'servicios',
  'Desarrollo web y tecnología': 'servicios',
  'Clases particulares': 'servicios',
  'Impresión y copiado': 'servicios',
  'Reparaciones y mantenimiento': 'servicios',
  // Organizaciones estudiantiles
  'Evento cultural': 'organizaciones',
  'Evento deportivo': 'organizaciones',
  'Convocatoria o concurso': 'organizaciones',
  'Comunicado oficial': 'organizaciones',
  'Actividad de voluntariado': 'organizaciones',
  // Otro
  'Otro': 'otro',
};

const groupColors = {
  productos: 'var(--primary)',
  servicios: 'var(--secondary)',
  organizaciones: 'var(--accent)',
  otro: 'var(--text-muted)',
};

export default function CategoryBadge({ 
  category, 
  selected = false,
  clickable = false, 
  onClick,
}) {
  const group = categoryGroups[category] || 'otro';
  const color = groupColors[group] || 'var(--text-muted)';

  const handleClick = (e) => {
    if (clickable && onClick) {
      e.stopPropagation();
      onClick(category);
    }
  };

  return (
    <span
      className={`category-badge`}
      onClick={handleClick}
      style={{
        backgroundColor: selected ? color : 'transparent',
        color: selected ? 'var(--text-primary)' : color,
        border: `1px solid ${color}`,
        fontSize: '12px',
        fontWeight: 600,
        padding: '2px 4px',
        borderRadius: 'var(--radius-sm)',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'all var(--transition-fast)',
        display: 'inline-flex',
        alignItems: 'center',
      }}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : -1}
    >
      <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {category?.substring(0, 18) || 'Categoría'}
      </span>
    </span>
  );
}

CategoryBadge.propTypes = {
  category: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
};