import React from 'react';
import PropTypes from 'prop-types';

/**
 * AnnouncementCardSkeleton
 * Placeholder con efecto shimmer que replica exactamente la estructura y
 * aspect-ratio (4/3) de AnnouncementCard para prevenir Content Layout Shift (CLS).
 */
export default function AnnouncementCardSkeleton({ className = '' }) {
  return (
    <article
      className={`card-mml ${className}`.trim()}
      aria-hidden="true"
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Zona de imagen con el mismo aspect-ratio 4/3 */}
      <div
        className="skeleton"
        style={{
          width: '100%',
          aspectRatio: '4 / 3',
          display: 'block',
        }}
      />

      {/* Contenido */}
      <div
        style={{
          padding: 'var(--spacing-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-xs)',
        }}
      >
        {/* Proyecto + Categoría */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--spacing-xs)',
          }}
        >
          <div
            className="skeleton"
            style={{ width: '32%', height: '14px', borderRadius: 'var(--radius-sm)' }}
          />
          <div
            className="skeleton"
            style={{ width: '22%', height: '20px', borderRadius: 'var(--radius-sm)' }}
          />
        </div>

        {/* Título en 2 líneas */}
        <div
          className="skeleton"
          style={{ width: '85%', height: '18px', borderRadius: 'var(--radius-sm)' }}
        />
        <div
          className="skeleton"
          style={{ width: '55%', height: '18px', marginBottom: 'var(--spacing-xs)', borderRadius: 'var(--radius-sm)' }}
        />

        {/* Descripción en 2 líneas */}
        <div
          className="skeleton"
          style={{ width: '100%', height: '14px', borderRadius: 'var(--radius-sm)' }}
        />
        <div
          className="skeleton"
          style={{ width: '70%', height: '14px', marginBottom: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)' }}
        />

        {/* Métricas y fecha */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'var(--spacing-xs)',
          }}
        >
          <div
            className="skeleton"
            style={{ width: '54px', height: '28px', borderRadius: 'var(--radius-sm)' }}
          />
          <div
            className="skeleton"
            style={{ width: '88px', height: '16px', borderRadius: 'var(--radius-sm)' }}
          />
        </div>
      </div>
    </article>
  );
}

AnnouncementCardSkeleton.propTypes = {
  className: PropTypes.string,
};
