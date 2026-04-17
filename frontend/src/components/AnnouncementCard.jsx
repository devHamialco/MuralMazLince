import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
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
}) {
  const {
    id,
    image_url,
    title,
    category,
    display_name,
    likes_count = 0,
    average_rating,
    status,
    created_at,
  } = announcement;

  const timeAgo = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return then.toLocaleDateString('es-MX');
  };

  return (
    <div 
      className="announcement-card card mb-3"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--bg-elevated)',
        borderRadius: 'var(--border-radius-lg)',
        overflow: 'hidden',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
      }}
    >
      <Link 
        to={`/announcement/${id}`}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        {/* Imagen */}
        <div 
          className="card-img-top position-relative"
          style={{
            height: '200px',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-elevated)',
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
                transition: 'transform var(--transition-normal)',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div 
              className="d-flex align-items-center justify-content-center h-100"
              style={{ color: 'var(--text-muted)' }}
            >
              <span>Sin imagen</span>
            </div>
          )}
          
          {/* Badge de categoría */}
          <div 
            className="position-absolute"
            style={{ top: '12px', left: '12px' }}
          >
            <CategoryBadge category={category} />
          </div>

          {/* Status badge */}
          {showStatus && status && status !== 'active' && (
            <div 
              className="position-absolute"
              style={{ top: '12px', right: '12px' }}
            >
              <StatusBadge status={status} />
            </div>
          )}
        </div>
      </Link>

      {/* Contenido */}
      <div className="card-body" style={{ padding: 'var(--spacing-md)' }}>
        <Link 
          to={`/announcement/${id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <h5 
            className="card-title mb-2"
            style={{
              fontWeight: 600,
              fontSize: '1.1rem',
              color: 'var(--text-primary)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {title}
          </h5>
        </Link>

        {/* Emprendedor */}
        <p 
          className="text-muted mb-3"
          style={{ fontSize: '0.85rem' }}
        >
          Por <span style={{ color: 'var(--primary-light)', fontWeight: 500 }}>{display_name}</span>
          <span style={{ marginLeft: '8px', color: 'var(--text-muted)' }}>
            • {timeAgo(created_at)}
          </span>
        </p>

        {/* Interacciones */}
        <div 
          className="d-flex align-items-center justify-content-between"
          style={{ borderTop: '1px solid var(--bg-elevated)', paddingTop: 'var(--spacing-sm)' }}
        >
          <div className="d-flex align-items-center gap-3">
            {/* Like */}
            <LikeButton 
              liked={userLiked}
              count={likes_count}
              onToggle={isAuthenticated ? () => onLike?.(id) : undefined}
              disabled={!isAuthenticated}
            />

            {/* Rating */}
            <StarRating 
              value={userRating}
              readonly={!isAuthenticated}
              size="sm"
            />
          </div>

          {/* Report button */}
          {isAuthenticated && onReport && (
            <button
              className="btn btn-link p-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onReport(id);
              }}
              style={{ 
                color: 'var(--text-muted)',
                textDecoration: 'none',
                fontSize: '0.85rem',
              }}
              title="Reportar"
            >
              Reportar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

AnnouncementCard.propTypes = {
  announcement: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    image_url: PropTypes.string,
    title: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    display_name: PropTypes.string,
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
};