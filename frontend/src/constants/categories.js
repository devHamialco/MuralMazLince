/**
 * @fileoverview Categorías unificadas del sistema - Versión reorganizada
 * Referencia: DDC v1.2 - Apéndice A del SRS v1.4
 *
 * ESTRUCTURA ACTUALIZADA:
 * - Nombres de categoría reducidos a 1 palabra para mejor visualización en mobile
 * - Agrupación en 2 grupos principales: Productos y Servicios
 * - El backend sigue recibiendo el nombre completo (singular), la UI muestra la versión abreviada
 *
 * Estas categorías se usan en:
 * - Feed.jsx (filtros)
 * - EntrepreneurDashboard.jsx (creación de proyectos/anuncios)
 * - CategoryBadge.jsx (badges en tarjetas)
 * - AnnouncementForm.jsx (formulario de creación)
 *
 * Importar desde este archivo para mantener consistencia.
 */

// Nueva estructura: objeto con grupos en lugar de array plano
// Esto permite agrupar visualmente y reduce la lista abrumadora
export const CATEGORIES = {
  // Grupo: Productos (7 categorías de 1 palabra)
  productos: [
    'Alimentos',
    'Postres',
    'Artesanías',
    'Ropa',
    'Papeleria',
    'Cosmeticos',
    'Plantas',
  ],
  // Grupo: Servicios (8 categorías de 1 palabra)
  servicios: [
    'Asesorias',
    'Diseño',
    'Fotografía',
    'Tecnologia',
    'Clases',
    'Impresión',
    'Mantenimiento',
  ],
  // Nota: Grupo "organizaciones" opcional - puede integrarse en uno de los dos grupos
  // o añadirse posteriormente si es necesario para casos de uso específicos.
};

// Mapeo exhaustivo de normalización de nombres largos de BD a las 14 subcategorías de 1 palabra
export const CATEGORY_NAME_NORMALIZATION = {
  // Productos (IDs 1-7)
  'Alimentos y bebidas': 'Alimentos',
  Alimentos: 'Alimentos',
  'Repostería y postres': 'Postres',
  Repostería: 'Postres',
  Postres: 'Postres',
  Postre: 'Postres',
  'Artesanías y manualidades': 'Artesanías',
  Artesanías: 'Artesanías',
  Artesanía: 'Artesanías',
  Artesania: 'Artesanías',
  'Ropa y accesorios': 'Ropa',
  Ropa: 'Ropa',
  'Papelería y material escolar': 'Papeleria',
  Papelería: 'Papeleria',
  Papeleria: 'Papeleria',
  'Cosméticos y cuidado personal': 'Cosmeticos',
  Cosméticos: 'Cosmeticos',
  Cosmeticos: 'Cosmeticos',
  'Plantas y decoración': 'Plantas',
  Plantas: 'Plantas',

  // Servicios (IDs 8-14)
  'Asesorías académicas y tutorías': 'Asesorias',
  Asesorías: 'Asesorias',
  Asesorias: 'Asesorias',
  'Diseño gráfico y digital': 'Diseño',
  Diseño: 'Diseño',
  Diseno: 'Diseño',
  'Fotografía y video': 'Fotografía',
  Fotografía: 'Fotografía',
  Fotografia: 'Fotografía',
  'Desarrollo web y tecnología': 'Tecnologia',
  Tecnología: 'Tecnologia',
  Tecnologia: 'Tecnologia',
  'Clases particulares (idiomas, música, deporte)': 'Clases',
  'Clases particulares': 'Clases',
  Clases: 'Clases',
  'Impresión y copiado': 'Impresión',
  Impresión: 'Impresión',
  Impresion: 'Impresión',
  'Reparaciones y mantenimiento': 'Mantenimiento',
  Reparaciones: 'Mantenimiento',
  Mantenimiento: 'Mantenimiento',

  Otro: 'Otro',
};

/**
 * Normaliza cualquier variante de nombre de categoría al formato estándar de 1 palabra.
 * @param {string} category - Nombre proveniente de la API o BD.
 * @returns {string} Nombre estandarizado de una sola palabra.
 */
export function normalizeCategory(category) {
  if (!category) return 'Sin categoría';
  return CATEGORY_NAME_NORMALIZATION[category] || category;
}

// Grupos temáticos para el color de los badges (consolidados en 2 grupos)
export const CATEGORY_GROUPS = {
  // Productos: todas mapean al grupo 'productos'
  Alimentos: 'productos',
  Postres: 'productos',
  Artesanías: 'productos',
  Ropa: 'productos',
  Papeleria: 'productos',
  Cosmeticos: 'productos',
  Plantas: 'productos',
  // Servicios: todas mapean al grupo 'servicios'
  Asesorias: 'servicios',
  Diseño: 'servicios',
  Fotografía: 'servicios',
  Tecnologia: 'servicios',
  Clases: 'servicios',
  Impresión: 'servicios',
  Mantenimiento: 'servicios',
};

// Etiquetas para mostrar en la UI - ahora todas son 1 palabra, el nombre viaja tal cual
// Pero mantenemos este objeto para futuras personalizaciones de display si se necesiten
export const CATEGORY_DISPLAY_LABELS = {
  // Ya no es necesario tener mapeo especial ya que todas son 1 palabra,
  // pero conservamos la estructura para compatibilidad futura
  Alimentos: 'Alimentos',
  Postres: 'Postres',
  Artesanías: 'Artesanías',
  Ropa: 'Ropa',
  Papeleria: 'Papeleria',
  Cosmeticos: 'Cosmeticos',
  Plantas: 'Plantas',
  Asesorias: 'Asesorias',
  Diseño: 'Diseño',
  Fotografía: 'Fotografía',
  Tecnologia: 'Tecnologia',
  Clases: 'Clases',
  Impresión: 'Impresión',
  Mantenimiento: 'Mantenimiento',
};

// Colores por grupo (para CategoryBadge)
export const GROUP_COLORS = {
  productos: 'var(--primary)',
  servicios: 'var(--secondary)',
};

// Mapeo de categoría a ID para compatibilidad con Dashboard y otras partes del sistema
// Los IDs del 1 al 15 corresponden a las categorías principales,
// el ID 20 es para "Otro" (cases extremos)
export const CATEGORY_NAME_TO_ID = {
  // Productos (IDs 1-7)
  Alimentos: 1,
  Postres: 2,
  Artesanías: 3,
  Ropa: 4,
  Papeleria: 5,
  Cosmeticos: 6,
  Plantas: 7,
  // Servicios (IDs 8-14)
  Asesorias: 8,
  Diseño: 9,
  Fotografía: 10,
  Tecnologia: 11,
  Clases: 12,
  Impresión: 13,
  Mantenimiento: 14,
  // Caso especial
  Otro: 20,
};

/**
 * Alias para backward compatibility - algunos componentes pueden importar CATEGORIES plano
// Exportamos arrays planos para quienes los usen directamente, pero se recomienda usar
// la estructura objeto CATEGORIES.{productos, servicios}
export const CATEGORIES_PRODUCTOS = [
  'Alimentos',
  'Postres',
  'Artesanías',
  'Ropa',
  'Papeleria',
  'Cosmeticos',
  'Plantas',
];

export const CATEGORIES_SERVICIOS = [
  'Asesorias',
  'Diseño',
  'Fotografía',
  'Tecnologia',
  'Clases',
  'Impresión',
  'Mantenimiento',
];

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
  return GROUP_COLORS[group] || GROUP_COLORS.productos; // default a productos
}

/**
 * Obtiene las categorías de un grupo específico
 * @param {string} group - Nombre del grupo ('productos' o 'servicios')
 * @returns {Array} Lista de categorías en ese grupo
 */
export function getCategoriesByGroup(group) {
  return CATEGORIES[group] || [];
}

/**
 * Verifica si una categoría es válida
 * @param {string} category - Nombre a verificar
 * @returns {boolean} Verdadera si la categoría existe en algún grupo
 */
export function isValidCategory(category) {
  return (
    CATEGORIES.productos.includes(category)
    || CATEGORIES.servicios.includes(category)
  );
}
