/**
 * @fileoverview AnnouncementCard — Tarjeta del feed principal (T15, implementacion-11.md)
 *
 * Renderiza un anuncio con imagen, título, nombre del emprendedor (display_name,
 * nunca el número de WhatsApp), métricas de likes / estrellas y acciones
 * contextuales según el rol del usuario (SRS RN-09, PRINC-02).
 *
 * Modos:
 *   - Visitante (ROL-01)     : LikeButton y StarRating en readonly; boton de reporte oculto.
 *   - Autenticado (ROL-02/03): Interacciones activas; botón de reporte visible.
 *   - Panel emprendedor      : `showStatus=true` muestra StatusBadge sobre la imagen.
 *
 * Soporta estado skeleton: cuando `announcement` no contiene datos, el componente
 * puede recibir props sin crashes gracias a los valores por defecto.
 *
 * Referencia: SRS RF-08, RF-09, RF-12, RF-13, RN-09, wireframes-spec WF-3.1.1
 */

/* AnnouncementCard -wireframes-spec.md WF-3.1.1 */

import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FiMessageCircle } from 'react-icons/fi';
import StarRating from './StarRating';
import LikeButton from './LikeButton';
import StatusBadge from './StatusBadge';

/**
 * Tarjeta de anuncio para el feed y el panel del emprendedor.
 *
 * @param {object}    props
 * @param {object} props.announcement - Datos del anuncio desde la API.
 * @param {number|string} props.announcement.id - ID único del anuncio.
 * @param {string} [props.announcement.image_url] - URL de imagen; puede faltar durante la carga.
 * @param {string} props.announcement.title - Título del anuncio.
 * @param {string} [props.announcement.project_name] - Nombre del proyecto padre.
 * @param {string} props.announcement.category - Código de categoría.
 * @param {string} [props.announcement.display_name] - Nombre público del emprendedor.
 * @param {string} [props.announcement.description] - Descripción del anuncio.
 * @param {number} [props.announcement.likes_count=0] - Likes activos.
 * @param {number} [props.announcement.average_rating] - Promedio de estrellas válidas.
 * @param {string} [props.announcement.status] - Estado del anuncio.
 * @param {string} [props.announcement.created_at] - Fecha de creación en formato ISO 8601.
 * @param {Function} [props.onLike] - Callback al dar o quitar like.
 * @param {Function} [props.onReport] - Callback al abrir el reporte.
 * @param {boolean} [props.userLiked=false] - Si el usuario ya dio like.
 * @param {boolean} [props.isAuthenticated=false] - Si hay una sesión activa.
 * @param {boolean} [props.showStatus=false] - Si se muestra el estado en la imagen.
 * @param {Function} [props.onInteractionAttempt] - Callback para visitantes sin sesión.
 */
export default function AnnouncementCard({
  announcement,
  onLike = null,
  onReport = null,
  userLiked = false,
  isAuthenticated = false,
  showStatus = false,
  onInteractionAttempt = null,
  // WF-3.x: document props for clarity
}) {
  const {
    id,
    image_url: imageUrl,
    title,
    project_name: projectName,
    description,
    likes_count: likesCount = 0,
    average_rating: averageRating,
    status,
    created_at: createdAt,
  } = announcement;

  /**
   * Formatea un timestamp ISO 8601 como texto relativo legible en español.
   * Usa convenciones móviles: “ahora” < 1 min, “hace Xm” < 1h, “hace Xh” < 24h, etc.
   *
   * @param   {string|Date} date - Timestamp válido.
   * @returns {string} Texto relativo. Ejemplo: “hace 3h”, “hace 2d”, “23/04”.
   */
  const formatTimeAgo = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `hace ${diffMins}m`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays < 7) return `hace ${diffDays}d`;
    return then.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div
      className="announcement-card card-mml"
      style={{
        position: 'relative',
        padding: 0,
        marginBottom: 'var(--spacing-md)',
        overflow: 'hidden',
      }}
    >
      <Link
        to={`/announcement/${id}`}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        {/* Zona de imagen - wireframes-spec:81-86 */}
        <div
          style={{
            width: '100%',
            height: '257px',
            position: 'relative',
            backgroundColor: 'var(--bg-surface)',
            overflow: 'hidden',
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            style={{
              position: imageUrl ? 'absolute' : 'relative',
              inset: imageUrl ? 0 : 'auto',
              display: imageUrl ? 'none' : 'flex',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-muted)',
              fontSize: '14px',
            }}
          >
            Sin imagen para mostrar
          </div>

          {showStatus && status && status !== 'active' && (
            <div
              style={{
                position: 'absolute',
                top: 'var(--spacing-sm)',
                right: 'var(--spacing-sm)',
              }}
            >
              <StatusBadge status={status} />
            </div>
          )}
        </div>
      </Link>

      {/* Report button - outside Link to avoid nested interactive elements */}
      {isAuthenticated && onReport && (
        <button
          type="button"
          onClick={() => onReport(id)}
          style={{
            position: 'absolute',
            top: 'var(--spacing-sm)',
            right: showStatus && status !== 'active' ? 'var(--spacing-2xl)' : 'var(--spacing-sm)',
            backgroundColor: 'rgba(0,0,0,0.4)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted)',
          }}
          title="Reportar"
          aria-label="Reportar anuncio"
        >
          <FiMessageCircle size={16} />
        </button>
      )}

      {/* Zona de contenido - wireframes-spec:88-110 */}
      <div style={{ padding: 'var(--spacing-sm) var(--spacing-md)', paddingBottom: 'var(--spacing-md)' }}>

        {/* Badges sobre imagen con backdrop para legibilidad */}
        <div>
          {projectName && (
            <div style={{
              color: 'var(--text-primary)',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
            >
              {projectName}
            </div>
          )}
        </div>

        {/* Fila 1: Nombre del proyecto + CategoryBadge */}
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h2
            style={{
              fontSize: '27px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginRight: 'var(--spacing-sm)',
            }}
          >
            {title}
          </h2>
        </div>

        {/* Fila 3: Descripción truncada - wireframes-spec:101-104 */}
        {description && (
          <p
            style={{
              fontSize: '16px',
              color: 'var(--text-secondary)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              marginBottom: 'var(--spacing-sm)',
            }}
          >
            {description}
          </p>
        )}

        {/* Fila 4: Métricas - wireframes-spec:106-110 */}
        <div
          className="d-flex align-items-center justify-content-between"
          style={{ marginTop: 'var(--spacing-sm)' }}
        >
          <div className="d-flex align-items-center gap-3">
            {/* LikeButton - wireframes-spec:108 */}
            <LikeButton
              liked={userLiked}
              count={likesCount}
              disabled={!isAuthenticated}
              onClick={isAuthenticated ? () => onLike?.(id) : onInteractionAttempt}
            />

            {/* StarRating - wireframes-spec:109 */}
            <StarRating
              value={averageRating || 0}
              readonly={!isAuthenticated}
              size={16}
            />
          </div>

          {/* Timestamp */}
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {formatTimeAgo(createdAt)}
          </span>
        </div>

        {/* Botón Ver detalle - wireframes-spec:112-120 */}
        <Link
          to={`/announcement/${id}`}
          className="btn-cta btn-cta-outline"
          style={{
            width: '100%',
            height: '40px',
            marginTop: 'var(--spacing-sm)',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Ver detalle
        </Link>
      </div>
    </div>
  );
}

AnnouncementCard.propTypes = {
  announcement: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    image_url: PropTypes.string,
    title: PropTypes.string.isRequired,
    project_name: PropTypes.string,
    category: PropTypes.string.isRequired,
    display_name: PropTypes.string,
    description: PropTypes.string,
    likes_count: PropTypes.number,
    average_rating: PropTypes.number,
    status: PropTypes.string,
    created_at: PropTypes.string,
  }).isRequired,
  onLike: PropTypes.func,
  onReport: PropTypes.func,
  userLiked: PropTypes.bool,
  isAuthenticated: PropTypes.bool,
  showStatus: PropTypes.bool,
  onInteractionAttempt: PropTypes.func,
};
