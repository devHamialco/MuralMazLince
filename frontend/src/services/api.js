/**
 * @fileoverview api.js — Capa de acceso al backend REST (T15, implementacion-11.md)
 *
 * Esta clase es la ÚNICA fuente de verdad para las llamadas al backend.
 * Ningún componente, hook o página debe hacer `fetch` directamente.
 *
 * Convenciones:
 *   - Todos los métodos devuelven `{ data, status }` en caso de éxito.
 *   - En caso de error lanzan un `Error` con `.status` y `.data` adjuntos.
 *   - `credentials: 'include'` está activo en todas las peticiones para
 *     transmitir la cookie HttpOnly de sesión (SAD §3.2, PRINC-02).
 *   - FormData se detecta automáticamente y omite `Content-Type` para
 *     permitir que el navegador establezca el boundary correcto.
 *
 * URL base:
 *   Leída desde `VITE_API_URL` (Vite). Si no está configurada en desarrollo,
 *   se emite un error en consola y se usa `http://localhost:3000` como fallback.
 *   En Railway, `VITE_API_URL` debe apuntar al backend de producción.
 *
 * Referencia: SRS RF-01 a RF-40, SAD COMP-03 a COMP-12, wireframes-spec WF-3.x
 */

// Resolver la URL base desde variables de entorno sin hardcodear valores.
const legacyRoot = typeof window !== 'undefined' ? window.REACT_APP_API_URL : undefined;
const API_BASE_URL =
  (import.meta && import.meta.env && import.meta.env.VITE_API_URL) ||
  legacyRoot ||
  'http://localhost:3000';

// Advertir en desarrollo si la variable no está configurada.
const hasViteApiUrl =
  typeof import.meta !== 'undefined' &&
  import.meta.env &&
  Object.prototype.hasOwnProperty.call(import.meta.env, 'VITE_API_URL');
const isDev =
  typeof import.meta !== 'undefined' && import.meta.env && !!import.meta.env.DEV;

if (!hasViteApiUrl && !legacyRoot && isDev) {
  // eslint-disable-next-line no-console
  console.error(
    '[api.js] VITE_API_URL no configurado. ' +
    'Usando http://localhost:3000. ' +
    'Establece VITE_API_URL en .env.local para apuntar al backend correcto.',
  );
}

/**
 * Cliente HTTP para el backend de Mural Maz Lince.
 * Instanciado como singleton al final del archivo y exportado como default.
 */
class ApiClient {
  constructor() {
    /** @type {string} URL base sin trailing slash */
    this.baseURL = API_BASE_URL;
  }

  /**
   * Método base que envuelve `fetch` con configuración común.
   * Maneja JSON y texto plano. Lanza si `response.ok` es false.
   *
   * @param   {string} endpoint            - Ruta relativa, ej: `/auth/login`.
   * @param   {RequestInit} [options={}]   - Opciones nativas de fetch (method, headers, body…).
   * @returns {Promise<{ data: any, status: number }>}
   * @throws  {Error} Con `.status` HTTP y `.data` del cuerpo del error.
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    };

    // Si hay body y es FormData, no establecer Content-Type
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      
      // Manejar respuestas no JSON
      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const error = new Error(data.message || data.error || 'Error en la solicitud');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return { data, status: response.status };
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ── Auth ────────────────────────────────────────────────────────────────

  /**
   * Obtiene el usuario autenticado desde la cookie de sesión activa (RF-01).
   *
   * @returns {Promise<{ data: { user: object }, status: number }>}
   * @throws  {Error} HTTP 401 si no hay sesión activa.
   */
  async getMe() {
    return this.request('/auth/me');
  }

  /**
   * Inicia sesión. El backend establece la cookie HttpOnly (RF-05).
   *
   * @param   {string}      matricula  - Matrícula universitaria de 8 dígitos.
   * @param   {string|null} [password] - Requerida para emprendedor/admin; null para visitante.
   * @returns {Promise<{ data: { user: object }, status: number }>}
   * @throws  {Error} HTTP 401 si credenciales inválidas; HTTP 403 si cuenta suspendida.
   */
  async login(matricula, password = null) {
    const payload = password ? { matricula, password } : { matricula };
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
  }

  /**
   * Registra un estudiante (ROL-01) usando solo su matrícula (RF-02).
   *
   * @param   {string} matricula - Matrícula válida (checksum automático en backend).
   * @returns {Promise<{ data: object, status: number }>}
   * @throws  {Error} HTTP 409 si matrícula ya registrada; HTTP 400 si checksum falla.
   */
  async registerStudent(matricula) {
    return this.request('/auth/register/student', { method: 'POST', body: JSON.stringify({ matricula }) });
  }

  /**
   * Registra un emprendedor (ROL-02/03) y establece sesión (RF-03).
   *
   * @param   {{ matricula: string, password: string, display_name: string,
   *             whatsapp: string, privacy_accepted: boolean }} data
   * @returns {Promise<{ data: { user: object }, status: number }>}
   * @throws  {Error} HTTP 409 si matrícula duplicada; HTTP 400 si bad-words en display_name.
   */
  async registerEntrepreneur(data) {
    return this.request('/auth/register/entrepreneur', { method: 'POST', body: JSON.stringify(data) });
  }

  /**
   * Cierra la sesión actual. El backend invalida la cookie HttpOnly (RF-07).
   *
   * @returns {Promise<{ data: object, status: number }>}
   */
  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  /**
   * Inicia un reclamo de matrícula en uso (RF-35).
   *
   * @param   {{ disputed_matricula: string, claimant_whatsapp: string }} data
   * @returns {Promise<{ data: object, status: number }>}
   * @throws  {Error} HTTP 409 si ya existe un ticket pendiente para esa matrícula.
   */
  async claimMatricula(data) {
    return this.request('/auth/claim-matricula', { method: 'POST', body: JSON.stringify(data) });
  }

  // ── Announcements ───────────────────────────────────────────────────────

  /**
   * Obtiene el feed paginado por cursor (RF-08, RF-09, ADR-03).
   * Solo devuelve anuncios con status='active'. Nunca incluye `whatsapp_number`.
   *
   * @param   {number|null} [cursor=null]   - ID del último anuncio recibido. Null = primera página.
   * @param   {string|null} [category=null] - Código de categoría para filtrar. Null = todas.
   * @returns {Promise<{ data: { announcements: Array, nextCursor: number|null, hasMore: boolean }, status: number }>}
   */
  async getAnnouncements(cursor = null, category = null) {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    if (category) params.append('category', category);
    const query = params.toString();
    return this.request(`/announcements${query ? `?${query}` : ''}`);
  }

  /**
   * Obtiene el detalle de un anuncio (RF-10, RF-11, RN-09).
   * Si hay sesión activa, el backend incluye `wa_link`. Nunca `whatsapp_number`.
   *
   * @param   {number|string} id
   * @returns {Promise<{ data: { announcement: object }, status: number }>}
   * @throws  {Error} HTTP 404 si no existe o no está activo.
   */
  async getAnnouncement(id) {
    return this.request(`/announcements/${id}`);
  }

  /**
   * Crea un nuevo anuncio (RF-19, RN-04). Solo emprendedor autenticado.
   * Envía FormData con imagen para procesamiento en backend.
   *
   * @param   {FormData} formData - Debe incluir: title, description, category_id,
   *                                expires_at, image (File, pre-comprimido).
   * @returns {Promise<{ data: { announcement: object }, status: number }>}
   * @throws  {Error} HTTP 409 si se alcanzan 3 anuncios activos en el proyecto (RN-04).
   */
  async createAnnouncement(formData) {
    return this.request('/announcements', {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * Actualiza campos editables de un anuncio (RF-20). Solo el dueño.
   *
   * @param   {number|string} id
   * @param   {{ title?: string, description?: string, category_id?: number }} data
   * @returns {Promise<{ data: object, status: number }>}
   * @throws  {Error} HTTP 404 si no encontrado; HTTP 403 si no es el dueño.
   */
  async updateAnnouncement(id, data) {
    return this.request(`/announcements/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Elimina un anuncio (RF-21). Solo el dueño. Operación irreversible.
   *
   * @param   {number|string} id
   * @returns {Promise<{ data: object, status: number }>}
   * @throws  {Error} HTTP 403 si no es el dueño.
   */
  async deleteAnnouncement(id) {
    return this.request(`/announcements/${id}`, { method: 'DELETE' });
  }

  // ── Interactions ─────────────────────────────────────────────────────────

  /**
   * Toggle like en un anuncio (RF-12, RN-08).
   * El backend determina si es accidental (revertido en < 5000 ms) y lo marca.
   *
   * @param   {number|string} announcementId
   * @returns {Promise<{ data: object, status: number }>}
   * @throws  {Error} HTTP 401 si no autenticado.
   */
  async toggleLike(announcementId) {
    return this.request(`/announcements/${announcementId}/like`, { method: 'POST' });
  }

  /**
   * Establece o modifica la valoración (1-3 estrellas) de un anuncio (RF-13, RN-08).
   * Si el mismo valor ya existe, el backend lo revierte (toggle implícito).
   *
   * @param   {number|string} announcementId
   * @param   {1|2|3}         rating - Número de estrellas.
   * @returns {Promise<{ data: object, status: number }>}
   */
  async setRating(announcementId, rating) {
    return this.request(`/announcements/${announcementId}/rating`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    });
  }

  /**
   * Revierte la valoración activa de un anuncio (RF-13).
   * Equivalente a marcar `reverted_at` en el backend.
   *
   * @param   {number|string} announcementId
   * @returns {Promise<{ data: object, status: number }>}
   */
  async removeRating(announcementId) {
    return this.request(`/announcements/${announcementId}/rating`, { method: 'DELETE' });
  }

  // ── Reports ──────────────────────────────────────────────────────────────

  /**
   * Reporta un anuncio con un motivo definido (RF-36, RN-13).
   * Si se alcanza el umbral (3 por defecto), el backend crea entrada en `moderation_queue`.
   *
   * @param   {number|string} announcementId
   * @param   {'offensive'|'spam'|'false_info'|'other'} reason
   * @returns {Promise<{ data: object, status: number }>}
   * @throws  {Error} HTTP 409 si el usuario ya reportó ese anuncio (RN-13).
   */
  async reportAnnouncement(announcementId, reason) {
    return this.request(`/announcements/${announcementId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // ── Projects ─────────────────────────────────────────────────────────────

  /**
   * Lista todos los proyectos del emprendedor autenticado (RF-15).
   *
   * @returns {Promise<{ data: { projects: Array }, status: number }>}
   */
  async getProjects() {
    return this.request('/projects');
  }

  /**
   * Obtiene el detalle de un proyecto con anuncios y métricas (RF-23, RF-24).
   * Solo accesible para el dueño.
   *
   * @param   {number|string} id
   * @returns {Promise<{ data: { project: object, announcements: Array, metrics: object }, status: number }>}
   * @throws  {Error} HTTP 404 si no encontrado o no es el dueño.
   */
  async getProject(id) {
    return this.request(`/projects/${id}`);
  }

  /**
   * Crea un nuevo proyecto (RF-15, RN-03). Máximo 5 activos.
   *
   * @param   {{ name: string, description?: string, category_id?: number }} data
   * @returns {Promise<{ data: { project: object }, status: number }>}
   * @throws  {Error} HTTP 409 si se alcanzan 5 proyectos activos.
   */
  async createProject(data) {
    return this.request('/projects', { method: 'POST', body: JSON.stringify(data) });
  }

  /**
   * Edita nombre, descripción o categoría de un proyecto (RF-16).
   *
   * @param   {number|string} id
   * @param   {{ name?: string, description?: string, category_id?: number }} data
   * @returns {Promise<{ data: object, status: number }>}
   */
  async updateProject(id, data) {
    return this.request(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  /**
   * Cambia el estado de un proyecto entre 'active' y 'suspended' (RF-17).
   * Al reactivar, valida que no se supere el límite de 5 activos.
   *
   * @param   {number|string}         id
   * @param   {'active'|'suspended'}  status
   * @returns {Promise<{ data: object, status: number }>}
   * @throws  {Error} HTTP 409 si reactivar supera el límite.
   */
  async updateProjectStatus(id, status) {
    return this.request(`/projects/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  }

  /**
   * Elimina un proyecto y todos sus anuncios (CASCADE) (RF-18).
   *
   * @param   {number|string} id
   * @returns {Promise<{ data: object, status: number }>}
   */
  async deleteProject(id) {
    return this.request(`/projects/${id}`, { method: 'DELETE' });
  }

  // ── Notifications ────────────────────────────────────────────────────────

  /**
   * Lista todas las notificaciones del usuario ordenadas por fecha DESC (RF-25).
   *
   * @returns {Promise<{ data: { notifications: Array }, status: number }>}
   */
  async getNotifications() {
    return this.request('/notifications');
  }

  /**
   * Marca una notificación como leída (RF-25).
   *
   * @param   {number|string} id - ID de la notificación del usuario autenticado.
   * @returns {Promise<{ data: object, status: number }>}
   */
  async markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  /**
   * Marca todas las notificaciones del usuario como leídas (RF-25).
   *
   * @returns {Promise<{ data: object, status: number }>}
   */
  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', { method: 'PATCH' });
  }

  // ── Admin ────────────────────────────────────────────────────────────────

  /**
   * Obtiene la cola de moderación ordenada por urgencia (RF-37).
   * Solo accesible para ROL-04 (admin).
   *
   * @returns {Promise<{ data: { queue: Array }, status: number }>}
   */
  async getModerationQueue() {
    return this.request('/admin/moderation-queue');
  }

  /**
   * Aprueba un anuncio en la cola de moderación (RF-37).
   *
   * @param   {number|string} id - ID del anuncio.
   * @returns {Promise<{ data: object, status: number }>}
   */
  async approveAnnouncement(id) {
    return this.request(`/admin/announcements/${id}/approve`, { method: 'PATCH' });
  }

  /**
   * Rechaza un anuncio de la cola de moderación (RF-37).
   *
   * @param   {number|string} id
   * @param   {string}        reason - Motivo de rechazo para notificar al emprendedor.
   * @returns {Promise<{ data: object, status: number }>}
   */
  async rejectAnnouncement(id, reason) {
    return this.request(`/admin/announcements/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) });
  }

  /**
   * Suspende la cuenta de un usuario (RF-38, RN-14). Solo admin.
   *
   * @param   {number|string} id - ID del usuario a suspender.
   * @returns {Promise<{ data: object, status: number }>}
   */
  async suspendUser(id) {
    return this.request(`/admin/users/${id}/suspend`, { method: 'POST' });
  }

  /**
   * Lista los tickets de reclamo de matrícula pendientes (RF-35). Solo admin.
   *
   * @returns {Promise<{ data: { tickets: Array }, status: number }>}
   */
  async getClaimTickets() {
    return this.request('/admin/claim-tickets');
  }

  /**
   * Marca un ticket de reclamo como resuelto (RF-35).
   *
   * @param   {number|string} id - ID del ticket.
   * @returns {Promise<{ data: object, status: number }>}
   */
  async resolveClaimTicket(id) {
    return this.request(`/admin/claim-tickets/${id}/resolve`, { method: 'PATCH' });
  }

  /**
   * Obtiene el QR de acceso a la plataforma generado por el backend.
   * El PNG puede descargarse desde la URL devuelta.
   *
   * @returns {Promise<{ data: { qr_url: string }, status: number }>}
   */
  async getQRCode() {
    return this.request('/admin/qr', { method: 'GET' });
  }

  // ── Categories ───────────────────────────────────────────────────────────

  /**
   * Lista todas las categorías activas del sistema.
   * Usado para los chips de filtro del feed y el selector en formularios.
   *
   * @returns {Promise<{ data: { categories: Array }, status: number }>}
   */
  async getCategories() {
    return this.request('/categories');
  }
}

const api = new ApiClient();
export default api;
