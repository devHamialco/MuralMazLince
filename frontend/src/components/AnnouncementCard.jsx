/* AnnouncementCard — Tarjeta del feed principal (T15, implementacion-11.md)
 * Refactorización completa con accesibilidad, rendimiento y diseño Mobile-First:
 * - Aspect-ratio 4/3 con loading="lazy" y decoding="async" (evita CLS y ahorra datos)
 * - Fallback "Sin imagen" centrado con useState(imgFailed)
 * - Título a 18px con line-clamp: 2 para móviles
 * - Patrón Stretched Link (tarjeta clickeable sin enlaces duplicados ni botones anidados)
 * - Botón reportar con target táctil >=44px, ícono FiFlag y contraste accesible en blanco
 * - Badges/Acciones en contenedor flex superior derecho con gap (sin hacks de offset)
 * - Nombre del proyecto con tamaño legible de 12px
 * - Semántica con <article> y <time dateTime={createdAt}>
 * - Componente AnnouncementCardSkeleton con mismo aspect-ratio
 * - Like con actualización optimista, animación pop y aria-pressed
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FiFlag, FiImage } from 'react-icons/fi';
import StarRating from './StarRating';
import LikeButton from './LikeButton';
import StatusBadge from './StatusBadge';
import CategoryBadge from './CategoryBadge';
import AnnouncementCardSkeleton from './AnnouncementCardSkeleton';

export { AnnouncementCardSkeleton };

export default function AnnouncementCard({
  announcement = null,
  onLike = null,
  onReport = null,
  userLiked = false,
  isAuthenticated = false,
  showStatus = false,
  onInteractionAttempt = null,
}) {
  const [imgFailed, setImgFailed] = useState(false);

  const {
    id,
    image_url: imageUrl,
    title,
    project_name: projectName,
    project_id: projectId,
    project_logo_url: projectLogoUrl,
    description,
    likes_count: likesCount = 0,
    avg_rating: avgRating,
    average_rating: legacyAverageRating = 0,
    status,
    category,
    created_at: createdAt,
  } = announcement || {};

  const averageRating = Number(avgRating ?? legacyAverageRating ?? 0);

  // Actualización optimista de likes
  const [optimisticLiked, setOptimisticLiked] = useState(Boolean(userLiked));
  const [optimisticLikesCount, setOptimisticLikesCount] = useState(
    Number(likesCount) || 0,
  );

  useEffect(() => {
    setOptimisticLiked(Boolean(userLiked));
  }, [userLiked]);

  useEffect(() => {
    setOptimisticLikesCount(Number(likesCount) || 0);
  }, [likesCount]);

  const handleLike = async (e) => {
    if (e?.stopPropagation) e.stopPropagation();

    if (!isAuthenticated) {
      if (onInteractionAttempt) {
        onInteractionAttempt();
      }
      return;
    }

    const previousLiked = optimisticLiked;
    const previousCount = optimisticLikesCount;
    const nextLiked = !previousLiked;
    const nextCount = nextLiked
      ? previousCount + 1
      : Math.max(0, previousCount - 1);

    // Estado optimista inmediato
    setOptimisticLiked(nextLiked);
    setOptimisticLikesCount(nextCount);

    if (onLike) {
      try {
        await onLike(id);
      } catch (err) {
        // Rollback ante fallos de red
        setOptimisticLiked(previousLiked);
        setOptimisticLikesCount(previousCount);
      }
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Sin fecha';

    const now = new Date();
    const then = new Date(date);
    if (Number.isNaN(then.getTime())) return 'Sin fecha';

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

  const hasImage = Boolean(imageUrl) && !imgFailed;

  return (
    <article
      className="card-mml"
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Contenedor de badges y acciones superiores (flex con gap) */}
      <div
        style={{
          position: 'absolute',
          top: 'var(--spacing-sm)',
          right: 'var(--spacing-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-xs)',
          zIndex: 2,
        }}
      >
        {showStatus && status && status !== 'active' && (
          <StatusBadge status={status} />
        )}

        {isAuthenticated && onReport && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onReport(id);
            }}
            aria-label="Reportar anuncio"
            title="Reportar anuncio"
            style={{
              width: '44px',
              height: '44px',
              minWidth: '44px',
              minHeight: '44px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              transition: 'background-color var(--transition-fast)',
            }}
          >
            <FiFlag size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Zona multimedia con aspect-ratio 4/3 */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 3',
          backgroundColor: 'var(--bg-surface)',
          overflow: 'hidden',
        }}
      >
        {hasImage ? (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--spacing-xs)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-muted)',
              fontSize: '14px',
              userSelect: 'none',
            }}
          >
            <FiImage size={28} aria-hidden="true" />
            <span>Sin imagen</span>
          </div>
        )}
      </div>

      {/* Contenido textual y métricas */}
      <div
        style={{
          padding: 'var(--spacing-md)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Encabezado: Nombre del proyecto (12px+) y CategoryBadge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--spacing-sm)',
            marginBottom: 'var(--spacing-xs)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              overflow: 'hidden',
            }}
          >
            {projectName && (
              projectId ? (
                <Link
                  to={`/proyecto/${projectId}`}
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    transition: 'color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {projectLogoUrl && (
                    <img
                      src={projectLogoUrl}
                      alt={projectName}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: '1px solid var(--border)',
                      }}
                    />
                  )}
                  <span>{projectName}</span>
                </Link>
              ) : (
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-secondary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {projectLogoUrl && (
                    <img
                      src={projectLogoUrl}
                      alt={projectName}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: '1px solid var(--border)',
                      }}
                    />
                  )}
                  <span>{projectName}</span>
                </span>
              )
            )}
          </div>

          {category && (
            <CategoryBadge
              category={category}
              selected={false}
              clickable={false}
            />
          )}
        </div>

        {/* Título (18px con line-clamp: 2 y Stretched Link) */}
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: 1.35,
            margin: '0 0 var(--spacing-xs) 0',
            color: 'var(--text-primary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          <Link
            to={`/announcement/${id}`}
            className="stretched-link"
            style={{
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            {title}
          </Link>
        </h3>

        {/* Descripción resumida */}
        {description && (
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
              marginBottom: 'var(--spacing-sm)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </p>
        )}

        {/* Métricas y fecha (con z-index: 2 para no ser interceptados por stretched-link) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'var(--spacing-xs)',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <LikeButton
              liked={optimisticLiked}
              count={optimisticLikesCount}
              onClick={handleLike}
              disabled={!isAuthenticated}
              size={18}
            />

            <StarRating
              value={averageRating}
              readonly
              size={16}
            />
          </div>

          {createdAt && (
            <time
              dateTime={createdAt}
              style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
              }}
            >
              {formatTimeAgo(createdAt)}
            </time>
          )}
        </div>
      </div>
    </article>
  );
}

AnnouncementCard.propTypes = {
  announcement: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    image_url: PropTypes.string,
    title: PropTypes.string.isRequired,
    project_name: PropTypes.string,
    description: PropTypes.string,
    likes_count: PropTypes.number,
    avg_rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    average_rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    status: PropTypes.string,
    category: PropTypes.string,
    created_at: PropTypes.string,
    display_name: PropTypes.string,
  }),
  onLike: PropTypes.func,
  onReport: PropTypes.func,
  userLiked: PropTypes.bool,
  isAuthenticated: PropTypes.bool,
  showStatus: PropTypes.bool,
  onInteractionAttempt: PropTypes.func,
};
