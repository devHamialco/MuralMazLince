/**
 * @fileoverview Categorías unificadas del sistema
 * Referencia: DDC v1.2 - Apéndice A del SRS v1.4
 *
 * Estas categorías se usan en:
 * - Feed.jsx (filtros)
 * - EntrepreneurDashboard.jsx (creación de proyectos/anuncios)
 * - CategoryBadge.jsx (badges en tarjetas)
 *
 * Importar desde este archivo para mantener consistencia.
 */

// Lista completa de categorías del sistema
export const CATEGORIES = [
  // Productos físicos
  'Alimentos y bebidas',
  'Repostería y postres',
  'Artesanías y manualidades',
  'Ropa y accesorios',
  'Papelería y material escolar',
  'Cosméticos y cuidado personal',
  'Plantas y decoración',
  // Servicios
  'Asesorías académicas y tutorías',
  'Diseño gráfico y digital',
  'Fotografía y video',
  'Desarrollo web y tecnología',
  'Clases particulares',
  'Impresión y copiado',
  'Reparaciones y mantenimiento',
  // Organizaciones estudiantiles
  'Evento cultural',
  'Evento deportivo',
  'Convocatoria o concurso',
  'Comunicado oficial',
  'Actividad de voluntariado',
  // Otro
  'Otro',
];

// Grupos temáticos para配色 de badges
export const CATEGORY_GROUPS = {
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
  Otro: 'otro',
};

// Colores por grupo (para CategoryBadge)
export const GROUP_COLORS = {
  productos: 'var(--primary)',
  servicios: 'var(--secondary)',
  organizaciones: 'var(--tertiary)',
  otro: 'var(--text-muted)',
};

/**
 * Obtiene el grupo de una categoría
 * @param {string} category - Nombre de la categoría
 * @returns {string} Grupo de la categoría
 */
export function getCategoryGroup(category) {
  return CATEGORY_GROUPS[category] || 'otro';
}

/**
 * Obtiene el color de una categoría según su grupo
 * @param {string} category - Nombre de la categoría
 * @returns {string} Color CSS token
 */
export function getCategoryColor(category) {
  const group = getCategoryGroup(category);
  return GROUP_COLORS[group] || GROUP_COLORS.otro;
}
