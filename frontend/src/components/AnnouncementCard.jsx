/* AnnouncementCard -wireframes-spec.md WF-3.1.1 */
/* Referencia: DDC 2.5, wireframes-spec.md */

import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FiUser, FiHeart, FiMessageCircle } from 'react-icons/fi';
import CategoryBadge from './CategoryBadge';
import StarRating from './StarRating';
import LikeButton from './LikeButton';
import StatusBadge from './StatusBadge';

export default function AnnouncementCard({
  announcement,
  onLike,
  onReport,
  userLiked = false,
  userRating = 0,
  isAuthenticated = false,
  showStatus = false,
  onInteractionAttempt,
}) {
  const {
    id,
    image_url,
    title,
    project_name,
    category,
    display_name,
    description,
    likes_count = 0,
    average_rating,
    status,
    created_at,
  } = announcement;

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

  const handleInteraction = (e, action) => {
    if (!isAuthenticated) {
      e.preventDefault();
      e.stopPropagation();
      onInteractionAttempt?.();
      return;
    }
    action?.();
  };

  return (
    <div
      className="announcement-card card-mml"
      style={{
        padding: 0,
        marginBottom: 'var(--spacing-md)',
        overflow: 'hidden',
        cursor: 'pointer',
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
          {image_url ? (
            <img
              src={image_url}
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
            className="d-flex align-items-center justify-content-center"
            style={{
              position: image_url ? 'absolute' : 'relative',
              inset: image_url ? 0 : 'auto',
              display: image_url && !announcement.image_url ? 'flex' : 'none',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-muted)',
              fontSize: '14px',
            }}
          >
            Sin imagen
          </div>

          {/* Badges sobre imagen */}
          <div
            style={{
              position: 'absolute',
              top: 'var(--spacing-sm)',
              left: 'var(--spacing-sm)',
              display: 'flex',
              gap: 'var(--spacing-xs)',
            }}
          >
            <CategoryBadge category={category} />
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

          {/* Ícono de reporte - wireframes-spec:651-653 */}
          {isAuthenticated && onReport && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onReport(id);
              }}
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
            >
              <FiMessageCircle size={16} />
            </button>
          )}
        </div>
      </Link>

      {/* Zona de contenido - wireframes-spec:88-110 */}
      <div style={{ padding: 'var(--spacing-sm) var(--spacing-md)', paddingBottom: 'var(--spacing-md)' }}>
        {/* Fila 1: Nombre del proyecto + CategoryBadge */}
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginRight: 'var(--spacing-sm)',
            }}
          >
            {project_name || title}
          </h2>
        </div>

        {/* Fila 2: Nombre visible del emprendedor - wireframes-spec:96-99 */}
        <div className="d-flex align-items-center mb-2" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          <FiUser size={16} style={{ marginRight: '4px', color: 'var(--text-secondary)' }} />
          <span>{display_name || 'Emprendedor'}</span>
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
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}> Ver más</span>
          </p>
        )}

        {/* Fila 4: Métricas - wireframes-spec:106-110 */}
        <div
          className="d-flex align-items-center justify-content-between"
          style={{ marginTop: 'var(--spacing-sm)' }}
        >
          <div className="d-flex align-items-center gap-3">
            {/* LikeButton - wireframes-spec:108 */}
            <div onClick={(e) => handleInteraction(e, () => onLike?.(id))}>
              <LikeButton
                liked={userLiked}
                count={likes_count}
                disabled={!isAuthenticated}
                onClick={isAuthenticated ? () => onLike?.(id) : onInteractionAttempt}
              />
            </div>

            {/* StarRating - wireframes-spec:109 */}
            <div onClick={(e) => handleInteraction(e)}>
              <StarRating
                value={average_rating || 0}
                readonly={!isAuthenticated}
                size={16}
              />
            </div>
          </div>

          {/* Timestamp */}
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {formatTimeAgo(created_at)}
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
  userRating: PropTypes.number,
  isAuthenticated: PropTypes.bool,
  showStatus: PropTypes.bool,
  onInteractionAttempt: PropTypes.func,
};