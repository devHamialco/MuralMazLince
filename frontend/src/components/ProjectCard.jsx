import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  FiFileText,
  FiTrash2,
  FiPauseCircle,
  FiPlayCircle,
  FiEdit2,
  FiChevronDown,
  FiChevronUp,
  FiHeart,
  FiStar,
  FiClock,
  FiFolder,
} from 'react-icons/fi';
import StatusBadge from './StatusBadge';
import CategoryBadge from './CategoryBadge';

/**
 * Formatea fecha para mostrar en anuncios del proyecto (es-MX).
 */
const formatExpiry = (expiresAt) => {
  if (!expiresAt) return 'Sin fecha de vencimiento';
  const d = new Date(expiresAt);
  if (Number.isNaN(d.getTime())) return 'Fecha inválida';
  return `Vence: ${d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}`;
};

/**
 * ProjectCard — Tarjeta de proyecto con gestión de estado y acordeón de anuncios.
 *
 * Mejoras aplicadas:
 * 1. Eliminación del antipatrón de contenedor interactivo (article con role=button).
 * 2. Botón de acordeón explícito con FiChevronDown/Up y WAI-ARIA aria-expanded.
 * 3. Eliminación de la prop huérfana no utilizada onCreateAnnouncement.
 * 4. Locale de fecha ajustado a es-MX.
 * 5. Targets táctiles mínimos de 44px en acciones para mobile-first.
 */
export default function ProjectCard({
  project,
  busy = false,
  onToggleStatus,
  onRequestDelete,
  onEditProject,
  onEditAnnouncement,
  onDeleteAnnouncement,
  announcements = [],
  loadingAnnouncements = false,
  onLoadAnnouncements = () => {},
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isActive = project.status === 'active';
  const count = project.announcements_count || 0;

  const handleToggleExpand = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    if (next && announcements.length === 0 && count > 0) {
      onLoadAnnouncements(project.id);
    }
  };

  return (
    <article className="project-card-ui">
      {count > 0 ? (
        <button
          type="button"
          className="project-card-toggle-trigger"
          onClick={handleToggleExpand}
          aria-expanded={isExpanded}
          aria-controls={`project-announcements-${project.id}`}
          aria-label={`${isExpanded ? 'Ocultar' : 'Ver'} ${count} ${count === 1 ? 'anuncio' : 'anuncios'} de ${project.name}`}
        >
          <div className="project-card-top" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-surface)',
                border: '1.5px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {project.logo_url ? (
                <img
                  src={project.logo_url}
                  alt={project.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <FiFolder size={18} style={{ color: 'var(--primary)' }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <h3 className="project-card-title">{project.name}</h3>
            </div>
            <StatusBadge status={project.status || 'active'} />
          </div>

          <p className="project-card-description">
            {project.description || 'Sin descripción detallada.'}
          </p>

          <div className="project-card-meta">
            <CategoryBadge category={project.category_name || 'Sin categoría'} />

            <span
              className="project-card-counter"
              style={{
                color: isExpanded ? 'var(--primary)' : 'var(--text-secondary)',
                gap: '6px',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <FiFileText aria-hidden="true" />
              <span>{count} {count === 1 ? 'anuncio' : 'anuncios'}</span>
              {isExpanded ? (
                <FiChevronUp aria-hidden="true" size={16} />
              ) : (
                <FiChevronDown aria-hidden="true" size={16} />
              )}
            </span>
          </div>
        </button>
      ) : (
        <div>
          <div className="project-card-top" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-surface)',
                border: '1.5px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {project.logo_url ? (
                <img
                  src={project.logo_url}
                  alt={project.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <FiFolder size={18} style={{ color: 'var(--primary)' }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <h3 className="project-card-title">{project.name}</h3>
            </div>
            <StatusBadge status={project.status || 'active'} />
          </div>

          <p className="project-card-description">
            {project.description || 'Sin descripción detallada.'}
          </p>

          <div className="project-card-meta">
            <CategoryBadge category={project.category_name || 'Sin categoría'} />

            <span className="project-card-counter" style={{ color: 'var(--text-muted)' }}>
              <FiFileText aria-hidden="true" />
              <span>0 anuncios</span>
            </span>
          </div>
        </div>
      )}

      <div>
        {/* Barra de acciones principales del proyecto */}
        <div className="project-card-actions">
          {/* Botón de Editar */}
          <button
            type="button"
            className="btn-project-edit"
            disabled={busy}
            onClick={() => onEditProject(project)}
            aria-label={`Editar proyecto ${project.name}`}
            style={{ minHeight: '44px' }}
          >
            <FiEdit2 aria-hidden="true" />
            <span>Editar</span>
          </button>

          {/* Botón de Suspender / Activar */}
          <button
            type="button"
            className="btn-project-status"
            disabled={busy}
            onClick={() => onToggleStatus(project.id, project.status)}
            aria-label={isActive ? `Suspender proyecto ${project.name}` : `Activar proyecto ${project.name}`}
            style={{ minHeight: '44px' }}
          >
            {isActive ? <FiPauseCircle aria-hidden="true" /> : <FiPlayCircle aria-hidden="true" />}
            <span>{isActive ? 'Suspender' : 'Activar'}</span>
          </button>

          {/* Botón de Eliminar */}
          <button
            type="button"
            className="btn-project-delete"
            disabled={busy}
            onClick={() => onRequestDelete(project)}
            aria-label={`Eliminar proyecto ${project.name}`}
            title="Eliminar proyecto"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <FiTrash2 aria-hidden="true" />
          </button>
        </div>

        {/* Acordeón para ver y gestionar anuncios asociados */}
        {count > 0 && isExpanded && (
          <div
            id={`project-announcements-${project.id}`}
            className="project-announcements-drawer mt-2"
          >
            {loadingAnnouncements && (
              <div className="text-center py-3">
                <div
                  className="spinner-border spinner-border-sm"
                  role="status"
                  style={{ color: 'var(--primary)' }}
                >
                  <span className="visually-hidden">Cargando anuncios…</span>
                </div>
              </div>
            )}

            {!loadingAnnouncements && announcements.map((item) => (
              <div key={item.id} className="announcement-item-card">
                <div className="announcement-item-header">
                  <h4 className="announcement-item-title">{item.title}</h4>
                  <StatusBadge status={item.status || 'active'} />
                </div>

                <div className="announcement-item-meta">
                  <span className="d-flex align-items-center gap-1">
                    <FiClock aria-hidden="true" />
                    <span>{formatExpiry(item.expires_at)}</span>
                  </span>

                  <span className="d-flex align-items-center gap-2">
                    <span className="d-flex align-items-center gap-1">
                      <FiHeart style={{ color: 'var(--primary)' }} aria-hidden="true" />
                      <span>{item.likes_count || 0}</span>
                    </span>
                    <span className="d-flex align-items-center gap-1">
                      <FiStar style={{ color: 'var(--accent)' }} aria-hidden="true" />
                      <span>{Number(item.avg_rating || 0).toFixed(1)}</span>
                    </span>
                  </span>
                </div>

                <div className="announcement-item-actions">
                  <button
                    type="button"
                    className="btn-announcement-action"
                    onClick={() => onEditAnnouncement(item)}
                    aria-label={`Editar anuncio ${item.title}`}
                    style={{ minHeight: '44px', padding: '0 14px' }}
                  >
                    <FiEdit2 aria-hidden="true" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    className="btn-announcement-action danger"
                    onClick={() => onDeleteAnnouncement(item)}
                    aria-label={`Eliminar anuncio ${item.title}`}
                    style={{ minHeight: '44px', padding: '0 14px' }}
                  >
                    <FiTrash2 aria-hidden="true" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

ProjectCard.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    status: PropTypes.string,
    category_name: PropTypes.string,
    logo_url: PropTypes.string,
    announcements_count: PropTypes.number,
  }).isRequired,
  busy: PropTypes.bool,
  onToggleStatus: PropTypes.func.isRequired,
  onRequestDelete: PropTypes.func.isRequired,
  onEditProject: PropTypes.func.isRequired,
  onEditAnnouncement: PropTypes.func.isRequired,
  onDeleteAnnouncement: PropTypes.func.isRequired,
  announcements: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    title: PropTypes.string.isRequired,
    status: PropTypes.string,
    expires_at: PropTypes.string,
    likes_count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    avg_rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  })),
  loadingAnnouncements: PropTypes.bool,
  onLoadAnnouncements: PropTypes.func,
};
