import PropTypes from 'prop-types';

const categoryColors = {
  // Productos físicos
  'Alimentos y bebidas': 'var(--category-productos)',
  'Repostería y postres': 'var(--category-productos)',
  'Artesanías y manualidades': 'var(--category-productos)',
  'Ropa y accesorios': 'var(--category-productos)',
  'Papelería y material escolar': 'var(--category-productos)',
  'Cosméticos y cuidado personal': 'var(--category-productos)',
  'Plantas y decoración': 'var(--category-productos)',
  // Servicios
  'Asesorías académicas y tutorías': 'var(--category-servicios)',
  'Diseño gráfico y digital': 'var(--category-servicios)',
  'Fotografía y video': 'var(--category-servicios)',
  'Desarrollo web y tecnología': 'var(--category-servicios)',
  'Clases particulares': 'var(--category-servicios)',
  'Impresión y copiado': 'var(--category-servicios)',
  'Reparaciones y mantenimiento': 'var(--category-servicios)',
  // Organizaciones
  'Evento cultural': 'var(--category-organizaciones)',
  'Evento deportivo': 'var(--category-organizaciones)',
  'Convocatoria o concurso': 'var(--category-organizaciones)',
  'Comunicado oficial': 'var(--category-organizaciones)',
  'Actividad de voluntariado': 'var(--category-organizaciones)',
  // Otro
  'Otro': 'var(--text-muted)',
};

const categoryGroups = {
  'Alimentos y bebidas': 'productos',
  'Repostería y postres': 'productos',
  'Artesanías y manualidades': 'productos',
  'Ropa y accesorios': 'productos',
  'Papelería y material escolar': 'productos',
  'Cosméticos y cuidado personal': 'productos',
  'Plantas y decoración': 'productos',
  'Asesorías académicas y tutorías': 'servicios',
  'Diseño gráfico y digital': 'servicios',
  'Fotografía y video': 'servicios',
  'Desarrollo web y tecnología': 'servicios',
  'Clases particulares': 'servicios',
  'Impresión y copiado': 'servicios',
  'Reparaciones y mantenimiento': 'servicios',
  'Evento cultural': 'organizaciones',
  'Evento deportivo': 'organizaciones',
  'Convocatoria o concurso': 'organizaciones',
  'Comunicado oficial': 'organizaciones',
  'Actividad de voluntariado': 'organizaciones',
  'Otro': 'otro',
};

export default function CategoryBadge({ category, clickable = false, onClick }) {
  const color = categoryColors[category] || 'var(--text-muted)';
  const group = categoryGroups[category] || 'otro';

  const handleClick = (e) => {
    if (clickable && onClick) {
      e.stopPropagation();
      onClick(category);
    }
  };

  const handleKeyDown = (e) => {
    if (clickable && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(category);
    }
  };

  return (
    <span
      className={`category-badge badge ${clickable ? 'clickable' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
        fontWeight: 500,
        fontSize: '0.75rem',
        padding: '4px 8px',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
      }}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {category}
    </span>
  );
}

CategoryBadge.propTypes = {
  category: PropTypes.string.isRequired,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
};