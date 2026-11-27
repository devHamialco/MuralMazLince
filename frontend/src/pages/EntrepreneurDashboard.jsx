import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  FiHeart,
  FiStar,
  FiFileText,
  FiFolder,
  FiAlertTriangle,
  FiPlus,
  FiClock,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiInstagram,
  FiPhone,
  FiMapPin,
  FiImage,
} from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { CATEGORY_NAME_TO_ID } from '../constants/categories';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import ChipNav from '../components/ChipNav';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import ProjectCard from '../components/ProjectCard';
import ProjectForm from '../components/ProjectForm';
import ProjectEditModal from '../components/ProjectEditModal';
import AnnouncementForm from '../components/AnnouncementForm';
import AnnouncementEditModal from '../components/AnnouncementEditModal';
import NotificationsPanel from '../components/NotificationsPanel';
import StatusBadge from '../components/StatusBadge';
import CategoryBadge from '../components/CategoryBadge';
import ImageUploader from '../components/ImageUploader';
import ImageCropper, { createCroppedFile } from '../components/ImageCropper';
import '../styles/dashboard.css';

/* ------------------------------------------------------------------ */
/* Constantes y Helpers                                               */
/* ------------------------------------------------------------------ */

const MAX_ACTIVE_PROJECTS = 5;

const TABS = {
  PROJECTS: 'projects',
  ANNOUNCEMENTS: 'announcements',
  NOTIFICATIONS: 'notifications',
  PROFILE: 'profile',
};

const TAB_OPTIONS = [
  { label: 'Mis Proyectos', value: TABS.PROJECTS },
  { label: 'Mis Anuncios', value: TABS.ANNOUNCEMENTS },
  { label: 'Notificaciones', value: TABS.NOTIFICATIONS },
  { label: 'Mi Perfil', value: TABS.PROFILE },
];

const EMPTY_PROJECT = { name: '', description: '', category: '' };
const EMPTY_ANNOUNCEMENT = {
  title: '',
  description: '',
  category: '',
  image: null,
  imagePreview: null,
  expires_at: '',
};

const EMPTY_METRICS = { total_likes: 0, avg_rating: 0, total_announcements: 0 };

/* ---------- Estilos reutilizables ---------- */
const surfaceCardStyle = {
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: '20px',
  marginBottom: '16px',
};

const fieldLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: '6px',
};

const sectionTitleStyle = {
  fontSize: '16px',
  fontWeight: 700,
  color: 'var(--text-primary)',
  margin: 0,
};

const TONE_STYLES = {
  neutral: { color: 'var(--text-secondary)', background: 'transparent' },
  warning: { color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.12)' },
  danger: { color: 'var(--status-rejected)', background: 'rgba(239, 68, 68, 0.1)' },
};

/**
 * Días restantes hasta la fecha de vencimiento.
 * null si no hay fecha o es inválida; <= 0 significa vencido.
 */
const getDaysLeft = (expiresAt) => {
  if (!expiresAt) return null;
  const d = new Date(expiresAt);
  if (Number.isNaN(d.getTime())) return null;
  return Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
};

/**
 * Etiqueta y tono visual del vencimiento de un anuncio (es-MX).
 */
const getExpiryInfo = (expiresAt) => {
  if (!expiresAt) return { label: 'Sin fecha de vencimiento', tone: 'neutral' };
  const d = new Date(expiresAt);
  if (Number.isNaN(d.getTime())) return { label: 'Fecha inválida', tone: 'neutral' };

  const days = getDaysLeft(expiresAt);
  if (days <= 0) return { label: 'Vencido', tone: 'danger' };
  if (days === 1) return { label: 'Vence en 1 día', tone: 'warning' };
  if (days <= 7) return { label: `Vence en ${days} días`, tone: 'warning' };
  return {
    label: `Vence el ${d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}`,
    tone: 'neutral',
  };
};

/* ------------------------------------------------------------------ */
/* Sub-componente: ProjectsTab                                         */
/* ------------------------------------------------------------------ */

function ProjectsTab({
  projects,
  loading,
  loadError,
  busyProjectIds,
  onRetry,
  isCreating,
  onStartCreate,
  onCancelCreate,
  onToggleStatus,
  onRequestDelete,
  onEditProject,
  onEditAnnouncement,
  onDeleteAnnouncement,
  projectAnnouncements,
  loadingAnnouncements,
  onLoadAnnouncements,
  activeProjectsCount,
  projectLimitReached,
  newProject,
  onChangeNewProject,
  creatingProject,
  onSubmitProject,
}) {
  if (isCreating) {
    return (
      <div>
        <div className="section-header">
          <h2 className="section-title">Nuevo Proyecto</h2>
          <button
            type="button"
            className="btn-cta btn-cta-secondary btn-cta-sm"
            onClick={onCancelCreate}
            style={{ minHeight: '44px', padding: '0 16px' }}
          >
            <span>Volver a mis proyectos</span>
          </button>
        </div>

        {projectLimitReached && (
          <div
            className="alert alert-warning mb-4"
            role="alert"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              borderColor: 'var(--warning)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            Ya tienes {activeProjectsCount} proyectos activos
            (máximo permitido: {MAX_ACTIVE_PROJECTS}).
            Suspende uno antes de crear uno nuevo.
          </div>
        )}

        <ProjectForm
          value={newProject}
          onChange={onChangeNewProject}
          submitting={creatingProject}
          onSubmit={onSubmitProject}
          onCancel={onCancelCreate}
          projectLimitReached={projectLimitReached}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title" style={{ marginBottom: '2px' }}>Mis Proyectos</h2>
          {!loading && !loadError && projects.length > 0 && (
            <span style={{ fontSize: '12px', color: projectLimitReached ? 'var(--warning)' : 'var(--text-muted)' }}>
              {activeProjectsCount} de {MAX_ACTIVE_PROJECTS} proyectos activos
            </span>
          )}
        </div>
        <button
          type="button"
          className="btn-cta btn-cta-primary btn-cta-sm"
          onClick={onStartCreate}
          style={{ minHeight: '44px', padding: '0 16px', gap: '6px' }}
        >
          <FiPlus aria-hidden="true" />
          <span>Nuevo Proyecto</span>
        </button>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border" role="status" style={{ color: 'var(--primary)' }}>
            <span className="visually-hidden">Cargando proyectos…</span>
          </div>
        </div>
      )}

      {!loading && loadError && (
        <EmptyState
          variant="error"
          icon={FiAlertTriangle}
          title="No pudimos cargar tus proyectos"
          subtitle="Hubo un problema de conexión. Por favor reintenta."
          actionLabel="Reintentar"
          onAction={onRetry}
        />
      )}

      {!loading && !loadError && projects.length === 0 && (
        <EmptyState
          icon={FiFolder}
          title="Todavía no tienes proyectos"
          subtitle="Crea tu primer proyecto para empezar a publicar anuncios y conectar con tus clientes."
          actionLabel="Crear mi primer proyecto"
          onAction={onStartCreate}
        />
      )}

      {!loading && !loadError && projects.length > 0 && (
        <div className="projects-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              busy={busyProjectIds.includes(project.id)}
              onToggleStatus={onToggleStatus}
              onRequestDelete={onRequestDelete}
              onEditProject={onEditProject}
              onEditAnnouncement={onEditAnnouncement}
              onDeleteAnnouncement={onDeleteAnnouncement}
              announcements={projectAnnouncements[project.id] || []}
              loadingAnnouncements={Boolean(loadingAnnouncements[project.id])}
              onLoadAnnouncements={onLoadAnnouncements}
            />
          ))}
        </div>
      )}
    </div>
  );
}

ProjectsTab.propTypes = {
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      status: PropTypes.string,
      category_name: PropTypes.string,
      announcements_count: PropTypes.number,
    }),
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  loadError: PropTypes.bool.isRequired,
  busyProjectIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  ).isRequired,
  onRetry: PropTypes.func.isRequired,
  isCreating: PropTypes.bool.isRequired,
  onStartCreate: PropTypes.func.isRequired,
  onCancelCreate: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func.isRequired,
  onRequestDelete: PropTypes.func.isRequired,
  onEditProject: PropTypes.func.isRequired,
  onEditAnnouncement: PropTypes.func.isRequired,
  onDeleteAnnouncement: PropTypes.func.isRequired,
  projectAnnouncements: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      }),
    ),
  ).isRequired,
  loadingAnnouncements: PropTypes.objectOf(PropTypes.bool).isRequired,
  onLoadAnnouncements: PropTypes.func.isRequired,
  activeProjectsCount: PropTypes.number.isRequired,
  projectLimitReached: PropTypes.bool.isRequired,
  newProject: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
  }).isRequired,
  onChangeNewProject: PropTypes.func.isRequired,
  creatingProject: PropTypes.bool.isRequired,
  onSubmitProject: PropTypes.func.isRequired,
};

/* ------------------------------------------------------------------ */
/* Sub-componente: AnnouncementItem (tarjeta de anuncio)               */
/* ------------------------------------------------------------------ */

function AnnouncementItem({ announcement, onEdit, onDelete }) {
  const [imgFailed, setImgFailed] = useState(false);
  const expiry = getExpiryInfo(announcement.expires_at);
  const tone = TONE_STYLES[expiry.tone];
  const likes = Number(announcement.likes_count) || 0;
  const rating = Number(announcement.avg_rating) || 0;
  const showImage = Boolean(announcement.image_url) && !imgFailed;

  return (
    <article style={{ ...surfaceCardStyle, marginBottom: 0, padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Miniatura + información principal */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <div
          style={{
            width: '88px',
            height: '88px',
            flexShrink: 0,
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
          }}
        >
          {showImage ? (
            <img
              src={announcement.image_url}
              alt=""
              loading="lazy"
              onError={() => setImgFailed(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <FiImage size={26} aria-hidden="true" />
          )}
        </div>

        <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
                wordBreak: 'break-word',
                lineHeight: 1.3,
              }}
            >
              {announcement.title}
            </h3>
            <StatusBadge status={announcement.status || 'active'} />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              fontSize: '13px',
              color: 'var(--text-secondary)',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
              <FiFolder aria-hidden="true" style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {announcement.project_name || 'Sin proyecto'}
              </span>
            </span>
            {announcement.category_name && (
              <CategoryBadge category={announcement.category_name} size="small" />
            )}
          </div>

          {announcement.description && (
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                lineHeight: 1.5,
                color: 'var(--text-secondary)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {announcement.description}
            </p>
          )}
        </div>
      </div>

      {/* Vigencia y rendimiento */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          flexWrap: 'wrap',
          paddingTop: '12px',
          borderTop: '1px solid var(--border)',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
            color: tone.color,
            backgroundColor: tone.background,
            padding: expiry.tone === 'neutral' ? 0 : '4px 10px',
            borderRadius: '999px',
          }}
        >
          <FiClock aria-hidden="true" />
          <span>{expiry.label}</span>
        </span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '14px', fontSize: '13px', fontWeight: 600 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }} title="Me gusta">
            <FiHeart style={{ color: 'var(--primary)' }} aria-hidden="true" />
            <span>{likes}</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }} title="Calificación promedio">
            <FiStar style={{ color: 'var(--accent)' }} aria-hidden="true" />
            <span>{rating > 0 ? rating.toFixed(1) : '—'}</span>
          </span>
        </span>
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          type="button"
          className="btn-project-edit"
          onClick={() => onEdit(announcement)}
          aria-label={`Editar anuncio ${announcement.title}`}
          style={{ minHeight: '44px', flex: 1 }}
        >
          <FiEdit2 aria-hidden="true" />
          <span>Editar</span>
        </button>
        <button
          type="button"
          className="btn-project-delete"
          onClick={() => onDelete(announcement)}
          aria-label={`Eliminar anuncio ${announcement.title}`}
          title="Eliminar anuncio"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <FiTrash2 aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

AnnouncementItem.propTypes = {
  announcement: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    image_url: PropTypes.string,
    status: PropTypes.string,
    expires_at: PropTypes.string,
    likes_count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    avg_rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    project_name: PropTypes.string,
    category_name: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

/* ------------------------------------------------------------------ */
/* Sub-componente: AnnouncementsTab                                    */
/* ------------------------------------------------------------------ */

function AnnouncementsTab({
  announcements,
  projects,
  loading,
  announcementsLoading,
  loadError,
  onRetry,
  isCreating,
  onStartCreate,
  onCancelCreate,
  onCreateProject,
  onEditAnnouncement,
  onDeleteAnnouncement,
  newAnnouncement,
  onChangeNewAnnouncement,
  selectedProject = null,
  onSelectProject,
  creatingAnnouncement,
  onSubmitAnnouncement,
}) {
  const [projectFilter, setProjectFilter] = useState('all');

  // Si el proyecto filtrado ya no existe, se vuelve a "todos"
  const activeFilter = projects.some((p) => String(p.id) === projectFilter) ? projectFilter : 'all';

  const visibleAnnouncements = useMemo(
    () => (activeFilter === 'all'
      ? announcements
      : announcements.filter((a) => String(a.project_id) === activeFilter)),
    [announcements, activeFilter],
  );

  if (isCreating) {
    return (
      <div>
        <div className="section-header">
          <h2 className="section-title">Nuevo Anuncio</h2>
          <button
            type="button"
            className="btn-cta btn-cta-secondary btn-cta-sm"
            onClick={onCancelCreate}
            style={{ minHeight: '44px', padding: '0 16px' }}
          >
            <span>Volver a mis anuncios</span>
          </button>
        </div>

        <AnnouncementForm
          projects={projects}
          value={newAnnouncement}
          onChange={onChangeNewAnnouncement}
          selectedProject={selectedProject}
          onSelectProject={onSelectProject}
          submitting={creatingAnnouncement}
          onSubmit={onSubmitAnnouncement}
          onCancel={onCancelCreate}
          onCreateProject={onCreateProject}
        />
      </div>
    );
  }

  // Spinner solo si aún no hay nada que mostrar (evita parpadeos al refrescar)
  const showSpinner = loading || (announcements.length === 0 && announcementsLoading);

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Mis Anuncios</h2>
        <button
          type="button"
          className="btn-cta btn-cta-primary btn-cta-sm"
          onClick={onStartCreate}
          disabled={projects.length === 0}
          style={{ minHeight: '44px', padding: '0 16px', gap: '6px' }}
        >
          <FiPlus aria-hidden="true" />
          <span>Nuevo Anuncio</span>
        </button>
      </div>

      {showSpinner && (
        <div className="text-center py-5">
          <div className="spinner-border" role="status" style={{ color: 'var(--primary)' }}>
            <span className="visually-hidden">Cargando anuncios…</span>
          </div>
        </div>
      )}

      {!showSpinner && loadError && (
        <EmptyState
          variant="error"
          icon={FiAlertTriangle}
          title="No pudimos cargar tus anuncios"
          subtitle="Hubo un problema de conexión. Por favor reintenta."
          actionLabel="Reintentar"
          onAction={onRetry}
        />
      )}

      {!showSpinner && !loadError && projects.length === 0 && (
        <EmptyState
          icon={FiFolder}
          title="Primero crea un proyecto"
          subtitle="Para poder publicar anuncios, necesitas al menos un proyecto activo donde alojarlos."
          actionLabel="Crear mi primer proyecto"
          onAction={onCreateProject}
        />
      )}

      {!showSpinner && !loadError && projects.length > 0 && announcements.length === 0 && (
        <EmptyState
          icon={FiFileText}
          title="Todavía no tienes anuncios"
          subtitle="Publica tu primer anuncio para conectar con tus clientes en el muro."
          actionLabel="Crear mi primer anuncio"
          onAction={onStartCreate}
        />
      )}

      {!showSpinner && !loadError && announcements.length > 0 && (
        <>
          {/* Barra de herramientas: conteo + filtro por proyecto */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '14px',
            }}
          >
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {visibleAnnouncements.length} {visibleAnnouncements.length === 1 ? 'anuncio' : 'anuncios'}
            </span>

            {projects.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="announcement-project-filter" style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                  Proyecto
                </label>
                <select
                  id="announcement-project-filter"
                  className="form-control"
                  value={activeFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  style={{ minHeight: '40px', maxWidth: '220px', color: 'var(--text-primary)' }}
                >
                  <option value="all">Todos</option>
                  {projects.map((p) => (
                    <option key={p.id} value={String(p.id)}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
              gap: '16px',
            }}
          >
            {visibleAnnouncements.map((announcement) => (
              <AnnouncementItem
                key={announcement.id}
                announcement={announcement}
                onEdit={onEditAnnouncement}
                onDelete={onDeleteAnnouncement}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

AnnouncementsTab.propTypes = {
  announcements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      status: PropTypes.string,
      expires_at: PropTypes.string,
      likes_count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      avg_rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      project_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      project_name: PropTypes.string,
      category_name: PropTypes.string,
    }),
  ).isRequired,
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      name: PropTypes.string,
    }),
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  announcementsLoading: PropTypes.bool.isRequired,
  loadError: PropTypes.bool.isRequired,
  onRetry: PropTypes.func.isRequired,
  isCreating: PropTypes.bool.isRequired,
  onStartCreate: PropTypes.func.isRequired,
  onCancelCreate: PropTypes.func.isRequired,
  onCreateProject: PropTypes.func.isRequired,
  onEditAnnouncement: PropTypes.func.isRequired,
  onDeleteAnnouncement: PropTypes.func.isRequired,
  newAnnouncement: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    image: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(File),
      PropTypes.shape({ name: PropTypes.string }),
    ]),
    imagePreview: PropTypes.string,
    expires_at: PropTypes.string,
  }).isRequired,
  onChangeNewAnnouncement: PropTypes.func.isRequired,
  selectedProject: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      name: PropTypes.string,
    }),
  ]),
  onSelectProject: PropTypes.func.isRequired,
  creatingAnnouncement: PropTypes.bool.isRequired,
  onSubmitAnnouncement: PropTypes.func.isRequired,
};

/* ------------------------------------------------------------------ */
/* Sub-componente: ProfileTab                                         */
/* ------------------------------------------------------------------ */

function ProfileTab({ user = null, onProfileUpdated }) {
  const { showToast } = useNotification();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bioShort, setBioShort] = useState(user?.bio_short || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp_number ? user.whatsapp_number.replace(/\+52/, '') : '');
  const [instagram, setInstagram] = useState(user?.instagram_handle || '');
  const [classroom, setClassroom] = useState(user?.classroom_location || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.profile_photo_url || null);
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [cropAreaPixels, setCropAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [croppedBase64, setCroppedBase64] = useState(null);
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;

    const loadProfileContacts = async () => {
      try {
        const response = await api.getMe();
        if (!isActive) return;

        const profile = response.data.user;
        setWhatsapp(profile.whatsapp_number ? profile.whatsapp_number.replace(/\+52/, '') : '');
        setInstagram(profile.instagram_handle || '');
        setClassroom(profile.classroom_location || '');
      } catch (loadError) {
        if (isActive) {
          setError(loadError.message || 'No se pudieron cargar los medios de contacto');
        }
      } finally {
        if (isActive) setProfileLoading(false);
      }
    };

    loadProfileContacts();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || '');
      setBioShort(user.bio_short || '');
      setWhatsapp(user.whatsapp_number ? user.whatsapp_number.replace(/\+52/, '') : '');
      setInstagram(user.instagram_handle || '');
      setClassroom(user.classroom_location || '');
      if (!croppedBase64) {
        setAvatarPreview(user.profile_photo_url || null);
      }
    }
  }, [user, croppedBase64]);

  const handleImageSelected = (_file, preview) => {
    setCropAreaPixels(null);
    setRawImageSrc(preview);
    setIsCropping(true);
  };

  const handleApplyCrop = useCallback(async () => {
    if (!rawImageSrc || !cropAreaPixels) return null;
    try {
      const { preview } = await createCroppedFile(rawImageSrc, cropAreaPixels);
      return preview.replace(/^data:image\/[a-z]+;base64,/, '');
    } catch (_err) {
      showToast('Error al procesar el recorte de imagen', 'error');
      return null;
    }
  }, [rawImageSrc, cropAreaPixels, showToast]);

  const handleChangeImage = () => {
    document.getElementById('profile-avatar-uploader-input')?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError('El nombre público no puede estar vacío');
      return;
    }

    const cleanWa = whatsapp.replace(/\D/g, '');
    if (cleanWa && cleanWa.length !== 10) {
      setError('El número de WhatsApp debe tener 10 dígitos');
      return;
    }

    const hasAnyContact = cleanWa || instagram.trim() || classroom.trim();
    if (!hasAnyContact) {
      setError('Debes mantener al menos un medio de contacto (WhatsApp, Instagram o Salón de clases)');
      return;
    }

    setSaving(true);
    try {
      const pendingCropBase64 = isCropping ? await handleApplyCrop() : null;
      const payload = {
        display_name: displayName.trim(),
        bio_short: bioShort.trim(),
        whatsapp_number: cleanWa || '',
        instagram_handle: instagram.trim() ? instagram.trim().replace(/^@+/, '') : '',
        classroom_location: classroom.trim() || '',
      };
      const profilePhotoBase64 = pendingCropBase64 || croppedBase64;
      if (profilePhotoBase64) {
        payload.profile_photo_base64 = profilePhotoBase64;
      }

      const res = await api.updateProfile(payload);
      showToast('Perfil actualizado correctamente', 'success');
      onProfileUpdated(res.data.user);
      setCroppedBase64(null);
      setIsCropping(false);
      setRawImageSrc(null);
      setCropAreaPixels(null);
    } catch (err) {
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  // Cuántos canales de contacto tiene configurados (informativo)
  const activeChannels = [
    whatsapp.replace(/\D/g, '').length === 10,
    Boolean(instagram.trim()),
    Boolean(classroom.trim()),
  ].filter(Boolean).length;

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
      <form onSubmit={handleSubmit}>
        {/* 1. Identidad: foto + nombre público */}
        <section style={surfaceCardStyle} aria-labelledby="profile-identity-title">
          <h2 id="profile-identity-title" style={{ ...sectionTitleStyle, marginBottom: '4px' }}>
            Mi Perfil
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 18px 0' }}>
            Así te verán los visitantes en el mural.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' }}>
            <div
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid var(--primary)',
                backgroundColor: 'var(--bg-base)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                flexShrink: 0,
              }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={displayName || 'Perfil'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <FiUser size={36} style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
              )}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-word', marginBottom: '8px' }}>
                {displayName.trim() || 'Tu nombre público'}
              </div>
              <div style={isCropping ? { display: 'none' } : undefined}>
                <ImageUploader
                  id="profile-avatar-uploader"
                  onImageChange={handleImageSelected}
                  buttonText="Cambiar foto de perfil"
                />
              </div>
            </div>
          </div>

          {isCropping && rawImageSrc && (
            <div style={{ marginBottom: '18px' }}>
              <ImageCropper
                imageSrc={rawImageSrc}
                onCropAreaChange={setCropAreaPixels}
                cropShape="round"
                aspect={1}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn-cta btn-cta-outline btn-cta-sm"
                  onClick={handleChangeImage}
                  style={{ minHeight: '44px' }}
                >
                  Elegir otra foto
                </button>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '18px' }}>
            <label htmlFor="profile-display-name" style={fieldLabelStyle}>
              Nombre público
            </label>
            <input
              id="profile-display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={80}
              placeholder="Tu nombre o el de tu emprendimiento"
              className="form-control"
              style={{ width: '100%', color: 'var(--text-primary)' }}
              required
            />
          </div>

          <div>
            <label htmlFor="profile-bio-short" style={fieldLabelStyle}>
              Tu historia
            </label>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 8px 0', lineHeight: 1.4 }}>
              Cuéntanos sobre tu proceso personal para crear tu emprendimiento
              {' '}o la meta que esperas alcanzar con él.
            </p>
            <textarea
              id="profile-bio-short"
              value={bioShort}
              onChange={(e) => setBioShort(e.target.value.slice(0, 200))}
              maxLength={200}
              rows={3}
              placeholder="¿Por qué decidiste emprender? ¿Qué te motiva a seguir adelante con tu proyecto?"
              className="form-control"
              style={{ width: '100%', color: 'var(--text-primary)', resize: 'vertical' }}
            />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px', marginBottom: 0 }}>
              {bioShort.length}/200
            </p>
          </div>
        </section>

        {/* 2. Medios de contacto */}
        <section style={surfaceCardStyle} aria-labelledby="profile-contact-title">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h3 id="profile-contact-title" style={sectionTitleStyle}>Medios de contacto</h3>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '999px',
                color: activeChannels === 0 ? 'var(--status-rejected)' : 'var(--primary)',
                backgroundColor: activeChannels === 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border)',
              }}
            >
              {activeChannels} de 3 activos
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
            Necesitas al menos un canal activo. Los clientes verán solo los que configures.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="profile-whatsapp" style={fieldLabelStyle}>
                <FiPhone size={14} style={{ color: 'var(--primary)' }} aria-hidden="true" /> WhatsApp (10 dígitos)
              </label>
              <input
                id="profile-whatsapp"
                type="tel"
                inputMode="numeric"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Ej: 6691234567"
                className="form-control"
                style={{ width: '100%', color: 'var(--text-primary)' }}
                disabled={profileLoading}
              />
            </div>

            <div>
              <label htmlFor="profile-instagram" style={fieldLabelStyle}>
                <FiInstagram size={14} style={{ color: 'var(--primary)' }} aria-hidden="true" /> Instagram (usuario sin @)
              </label>
              <input
                id="profile-instagram"
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Ej: mi_negocio_lince"
                className="form-control"
                style={{ width: '100%', color: 'var(--text-primary)' }}
                disabled={profileLoading}
              />
            </div>

            <div>
              <label htmlFor="profile-classroom" style={fieldLabelStyle}>
                <FiMapPin size={14} style={{ color: 'var(--primary)' }} aria-hidden="true" /> Salón o ubicación en el campus
              </label>
              <input
                id="profile-classroom"
                type="text"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                maxLength={100}
                placeholder="Ej: Edificio C, Aula 14 (Turno matutino)"
                className="form-control"
                style={{ width: '100%', color: 'var(--text-primary)' }}
                disabled={profileLoading}
              />
            </div>
          </div>
        </section>

        {/* 3. Barra de guardado fija: el botón y los errores siempre a la vista */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            zIndex: 5,
            backgroundColor: 'var(--bg-base)',
            borderTop: '1px solid var(--border)',
            padding: '12px 0 calc(12px + env(safe-area-inset-bottom, 0px))',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {error && (
            <div
              role="alert"
              style={{
                padding: '10px 14px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--status-rejected)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--status-rejected)',
                fontSize: '13px',
              }}
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            className="btn-cta btn-cta-primary"
            disabled={saving}
            style={{ width: '100%', minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}

ProfileTab.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    display_name: PropTypes.string,
    bio_short: PropTypes.string,
    profile_photo_url: PropTypes.string,
    whatsapp_number: PropTypes.string,
    instagram_handle: PropTypes.string,
    classroom_location: PropTypes.string,
  }),
  onProfileUpdated: PropTypes.func.isRequired,
};

/* ------------------------------------------------------------------ */
/* Página principal: EntrepreneurDashboard                             */
/* ------------------------------------------------------------------ */

export default function EntrepreneurDashboard() {
  const { user, updateUser } = useAuth();
  const {
    showToast,
    notifications,
    unreadCount,
    loading: notificationsLoading,
    error: notificationsError,
    markAsRead,
    markAllAsRead,
    loadNotifications,
  } = useNotification();

  const [activeTab, setActiveTab] = useState(TABS.PROJECTS);
  const [projects, setProjects] = useState([]);
  const [metrics, setMetrics] = useState(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Modos de formulario en pestañas
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [creatingAnnouncement, setCreatingAnnouncement] = useState(false);

  // Estados de eliminación de proyecto
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deletingProject, setDeletingProject] = useState(false);
  const [busyProjectIds, setBusyProjectIds] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  // Estados de edición de proyecto
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [editingProject, setEditingProject] = useState(false);

  // Estados de anuncios asociados
  const [projectAnnouncements, setProjectAnnouncements] = useState({});
  const [loadingAnnouncements, setLoadingAnnouncements] = useState({});

  // Estados de edición y eliminación de anuncio
  const [announcementToEdit, setAnnouncementToEdit] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState(false);

  // Borradores que persisten al cambiar de pestaña
  const [newProject, setNewProject] = useState(EMPTY_PROJECT);
  const [newAnnouncement, setNewAnnouncement] = useState(EMPTY_ANNOUNCEMENT);

  const showToastRef = useRef(showToast);
  const loadNotificationsRef = useRef(loadNotifications);
  useEffect(() => {
    showToastRef.current = showToast;
    loadNotificationsRef.current = loadNotifications;
  }, [showToast, loadNotifications]);

  const isMountedRef = useRef(true);
  const latestRequestRef = useRef(0);

  /* ---------------------------- Carga de datos ----------------------- */

  const handleLoadProjectAnnouncements = useCallback(async (projectId) => {
    setLoadingAnnouncements((prev) => ({ ...prev, [projectId]: true }));
    try {
      const res = await api.getProject(projectId);
      if (res?.data?.announcements) {
        setProjectAnnouncements((prev) => ({
          ...prev,
          [projectId]: res.data.announcements,
        }));
      }
    } catch (err) {
      console.error('Error loading project announcements:', err);
    } finally {
      setLoadingAnnouncements((prev) => ({ ...prev, [projectId]: false }));
    }
  }, []);

  const fetchProjects = useCallback(async ({ silent = false } = {}) => {
    latestRequestRef.current += 1;
    const requestId = latestRequestRef.current;

    if (!silent) {
      setLoading(true);
      setLoadError(false);
    }

    const [projectsResult, metricsResult] = await Promise.allSettled([
      api.getProjects(),
      api.getMetrics(),
    ]);

    if (!isMountedRef.current || requestId !== latestRequestRef.current) return;

    if (projectsResult.status === 'fulfilled') {
      const normalizedProjects = (projectsResult.value.data.projects || []).map((project) => ({
        ...project,
        announcements_count: Number(project.announcements_count ?? 0),
      }));
      setProjects(normalizedProjects);
      setLoadError(false);

      // Cargar anuncios de todos los proyectos concurrentemente para "Mis Anuncios"
      normalizedProjects.forEach((proj) => {
        handleLoadProjectAnnouncements(proj.id);
      });
    } else {
      console.error('Error loading projects:', projectsResult.reason);
      if (!silent) setLoadError(true);
      showToastRef.current('Error al cargar proyectos', 'error');
    }

    if (metricsResult.status === 'fulfilled') {
      setMetrics(metricsResult.value.data.metrics || EMPTY_METRICS);
    } else {
      console.error('Error loading metrics:', metricsResult.reason);
    }

    setLoading(false);
  }, [handleLoadProjectAnnouncements]);

  const handleRetryNotifications = useCallback(() => {
    loadNotificationsRef.current?.();
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    setProjects([]);
    setMetrics(EMPTY_METRICS);
    setProjectAnnouncements({});
    fetchProjects();
    loadNotificationsRef.current?.();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchProjects, user?.id]);

  /* --------------------------- Derivados ----------------------------- */

  const activeProjectsCount = useMemo(
    () => projects.filter((project) => project.status === 'active').length,
    [projects],
  );
  const projectLimitReached = activeProjectsCount >= MAX_ACTIVE_PROJECTS;

  const tabOptions = useMemo(
    () => TAB_OPTIONS.map((option) => {
      if (option.value === TABS.NOTIFICATIONS) {
        return { ...option, badge: unreadCount };
      }
      return option;
    }),
    [unreadCount],
  );

  const avgRatingNum = Number(metrics.avg_rating);
  const avgRatingLabel = Number.isFinite(avgRatingNum) && avgRatingNum > 0
    ? avgRatingNum.toFixed(1)
    : '—';

  // Lista agregada y ordenada de todos los anuncios del usuario
  const allAnnouncements = useMemo(() => {
    const list = [];
    projects.forEach((proj) => {
      const pAnnouncements = projectAnnouncements[proj.id] || [];
      pAnnouncements.forEach((a) => {
        list.push({
          ...a,
          project_id: proj.id,
          project_name: proj.name,
          project_logo_url: proj.logo_url,
          category_name: a.category_name || proj.category_name || a.custom_category,
        });
      });
    });
    list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return list;
  }, [projects, projectAnnouncements]);

  // True mientras algún proyecto está cargando sus anuncios
  const announcementsLoading = useMemo(
    () => Object.values(loadingAnnouncements).some(Boolean),
    [loadingAnnouncements],
  );

  // Resumen de anuncios que necesitan atención (por vencer / vencidos)
  const expiryAlerts = useMemo(() => {
    let soon = 0;
    let expired = 0;
    allAnnouncements.forEach((a) => {
      const days = getDaysLeft(a.expires_at);
      if (days === null) return;
      if (days <= 0) expired += 1;
      else if (days <= 7) soon += 1;
    });
    return { soon, expired };
  }, [allAnnouncements]);

  /* ---------------------- Helpers de Busy ---------------------------- */

  const markBusy = useCallback((id) => {
    setBusyProjectIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const unmarkBusy = useCallback((id) => {
    setBusyProjectIds((prev) => prev.filter((item) => item !== id));
  }, []);

  /* ----------------------------- Creación ---------------------------- */

  const handleCreateProject = async (name, description, category, logoBase64 = null) => {
    if (creatingProject) return false;
    setCreatingProject(true);
    try {
      const response = await api.createProject({
        name,
        description,
        category,
        logo_base64: logoBase64 || undefined,
      });
      const createdProject = response?.data?.project;
      if (createdProject) {
        setProjects((prev) => [
          {
            ...createdProject,
            description: createdProject.description ?? (description || null),
            category_name: createdProject.category_name ?? (category || null),
            announcements_count: Number(createdProject.announcements_count ?? 0),
          },
          ...prev.filter((item) => item.id !== createdProject.id),
        ]);
      }
      showToast('Proyecto creado correctamente', 'success');
      setNewProject(EMPTY_PROJECT);
      setIsCreatingProject(false);
      setActiveTab(TABS.PROJECTS);
      await fetchProjects({ silent: true });
      return true;
    } catch (error) {
      if (error.status === 409) {
        showToast(`Has alcanzado el límite de ${MAX_ACTIVE_PROJECTS} proyectos activos`, 'warning');
      } else {
        console.error('Error creating project:', error);
        showToast('Error al crear proyecto', 'error');
      }
      return false;
    } finally {
      setCreatingProject(false);
    }
  };

  const handleCreateAnnouncement = async (payload) => {
    if (creatingAnnouncement) return false;
    if (!payload.image || !payload.projectId) {
      showToast('Selecciona una imagen y un proyecto', 'warning');
      return false;
    }

    setCreatingAnnouncement(true);
    try {
      const formData = new FormData();
      formData.append('title', payload.title);
      formData.append('description', payload.description);
      formData.append('custom_category', payload.category);
      formData.append('image', payload.image);
      formData.append('project_id', payload.projectId);
      if (payload.expires_at) {
        formData.append('expires_at', payload.expires_at);
      }

      await api.createAnnouncement(formData);
      showToast('Anuncio publicado con éxito', 'success');
      setNewAnnouncement(EMPTY_ANNOUNCEMENT);
      setSelectedProject(null);
      setIsCreatingAnnouncement(false);
      setActiveTab(TABS.ANNOUNCEMENTS);
      await Promise.all([
        fetchProjects({ silent: true }),
        handleLoadProjectAnnouncements(payload.projectId),
      ]);
      loadNotificationsRef.current?.();
      return true;
    } catch (error) {
      console.error('Error creating announcement:', error);
      if (error.status === 409) {
        showToast(error.message || 'No se pudo crear el anuncio', 'warning');
      } else {
        showToast('Error al crear anuncio', 'error');
      }
      return false;
    } finally {
      setCreatingAnnouncement(false);
    }
  };

  /* ----------------------------- Edición Proyecto -------------------- */

  const handleOpenEditProject = useCallback((project) => {
    setProjectToEdit(project);
  }, []);

  const handleCloseEditProject = useCallback(() => {
    if (!editingProject) setProjectToEdit(null);
  }, [editingProject]);

  const handleSaveEditProject = async (projectId, data) => {
    if (editingProject) return false;
    setEditingProject(true);
    try {
      const categoryId = CATEGORY_NAME_TO_ID[data.category] || null;
      const res = await api.updateProject(projectId, {
        name: data.name,
        description: data.description,
        category_id: categoryId,
        category: data.category,
        logo_base64: data.logo_base64 || undefined,
      });
      const updatedProject = res?.data?.project;
      if (updatedProject) {
        setProjects((prev) => (
          prev.map((p) => (p.id === projectId ? { ...p, ...updatedProject } : p))
        ));
      }
      showToast('Proyecto actualizado con éxito', 'success');
      setProjectToEdit(null);
      fetchProjects({ silent: true });
      return true;
    } catch (err) {
      console.error('Error updating project:', err);
      showToast('Error al actualizar el proyecto', 'error');
      return false;
    } finally {
      setEditingProject(false);
    }
  };

  /* ------------------------ Edición Anuncio -------------------------- */

  const handleOpenEditAnnouncement = useCallback((announcement) => {
    setAnnouncementToEdit(announcement);
  }, []);

  const handleCloseEditAnnouncement = useCallback(() => {
    if (!editingAnnouncement) setAnnouncementToEdit(null);
  }, [editingAnnouncement]);

  const handleSaveEditAnnouncement = async (announcementId, data) => {
    if (editingAnnouncement) return false;
    setEditingAnnouncement(true);
    try {
      const categoryId = CATEGORY_NAME_TO_ID[data.category] || null;
      await api.updateAnnouncement(announcementId, {
        title: data.title,
        description: data.description,
        custom_category: data.category,
        category_id: categoryId,
        expires_at: data.expires_at,
      });
      showToast('Anuncio actualizado correctamente', 'success');
      setAnnouncementToEdit(null);
      fetchProjects({ silent: true });
      Object.keys(projectAnnouncements).forEach((pid) => {
        handleLoadProjectAnnouncements(pid);
      });
      return true;
    } catch (err) {
      console.error('Error updating announcement:', err);
      showToast('Error al actualizar el anuncio', 'error');
      return false;
    } finally {
      setEditingAnnouncement(false);
    }
  };

  /* ------------------------ Eliminación Anuncio ---------------------- */

  const handleOpenDeleteAnnouncement = useCallback((announcement) => {
    setAnnouncementToDelete(announcement);
  }, []);

  const handleCloseDeleteAnnouncement = useCallback(() => {
    if (!deletingAnnouncement) setAnnouncementToDelete(null);
  }, [deletingAnnouncement]);

  const handleConfirmDeleteAnnouncement = async () => {
    if (!announcementToDelete || deletingAnnouncement) return;
    setDeletingAnnouncement(true);
    try {
      await api.deleteAnnouncement(announcementToDelete.id);
      showToast('Anuncio eliminado correctamente', 'success');
      setAnnouncementToDelete(null);
      fetchProjects({ silent: true });
      Object.keys(projectAnnouncements).forEach((pid) => {
        handleLoadProjectAnnouncements(pid);
      });
    } catch (err) {
      console.error('Error deleting announcement:', err);
      showToast('Error al eliminar el anuncio', 'error');
    } finally {
      setDeletingAnnouncement(false);
    }
  };

  /* ----------------------------- Eliminación Proyecto ---------------- */

  const handleOpenDeleteProject = useCallback(
    (project) => {
      if (busyProjectIds.includes(project.id) || projectToDelete) return;
      markBusy(project.id);
      setProjectToDelete(project);
    },
    [busyProjectIds, projectToDelete, markBusy],
  );

  const resetDeleteState = useCallback(() => {
    setProjectToDelete((current) => {
      if (current) unmarkBusy(current.id);
      return null;
    });
  }, [unmarkBusy]);

  const handleCancelDelete = useCallback(() => {
    if (deletingProject) return;
    resetDeleteState();
  }, [deletingProject, resetDeleteState]);

  const handleConfirmDeleteProject = async () => {
    if (!projectToDelete || deletingProject) return;
    const { id } = projectToDelete;
    setDeletingProject(true);
    try {
      await api.deleteProject(id);
      showToast('Proyecto eliminado correctamente', 'success');
      setSelectedProject((current) => {
        if (current === id || current?.id === id) return null;
        return current;
      });
      resetDeleteState();
      fetchProjects({ silent: true });
    } catch (error) {
      console.error('Error deleting project:', error);
      showToast('Error al eliminar proyecto', 'error');
    } finally {
      setDeletingProject(false);
    }
  };

  /* ------------------------ Estado Proyecto -------------------------- */

  const handleToggleProjectStatus = useCallback(
    async (projectId, currentStatus) => {
      if (busyProjectIds.includes(projectId)) return;
      markBusy(projectId);
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      try {
        await api.updateProjectStatus(projectId, newStatus);
        showToast(`Proyecto ${newStatus === 'active' ? 'activado' : 'suspendido'}`, 'success');
        fetchProjects({ silent: true });
      } catch (error) {
        console.error('Error updating project status:', error);
        showToast('Error al actualizar proyecto', 'error');
      } finally {
        unmarkBusy(projectId);
      }
    },
    [busyProjectIds, markBusy, unmarkBusy, showToast, fetchProjects],
  );

  /* ------------------------ Acción rápida del encabezado ------------- */

  const hasProjects = projects.length > 0;

  const handleHeaderCta = () => {
    if (hasProjects) {
      setActiveTab(TABS.ANNOUNCEMENTS);
      setIsCreatingAnnouncement(true);
    } else {
      setActiveTab(TABS.PROJECTS);
      setIsCreatingProject(true);
    }
  };

  /* ------------------------------ Render ----------------------------- */

  const alertParts = [];
  if (expiryAlerts.expired > 0) {
    alertParts.push(
      `${expiryAlerts.expired} ${expiryAlerts.expired === 1 ? 'anuncio vencido' : 'anuncios vencidos'}`,
    );
  }
  if (expiryAlerts.soon > 0) {
    alertParts.push(
      `${expiryAlerts.soon} ${expiryAlerts.soon === 1 ? 'anuncio vence' : 'anuncios vencen'} en los próximos 7 días`,
    );
  }
  const showExpiryBanner = alertParts.length > 0 && activeTab !== TABS.ANNOUNCEMENTS;
  const bannerTone = expiryAlerts.expired > 0 ? TONE_STYLES.danger : TONE_STYLES.warning;

  return (
    <div className="dashboard-root">
      <Navbar />

      <main className="dashboard-layout">
        {/* Encabezado: identidad + acción principal */}
        <header className="dashboard-header">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '2px solid var(--primary)',
                  backgroundColor: 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {user?.profile_photo_url ? (
                  <img
                    src={user.profile_photo_url}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <FiUser size={24} style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
                )}
              </div>
              <div className="dashboard-title-group" style={{ minWidth: 0 }}>
                <h1>Bienvenido, {user?.display_name || 'emprendedor'}</h1>
                <p>Gestiona tus proyectos, anuncios y rendimiento en tiempo real.</p>
              </div>
            </div>

            <button
              type="button"
              className="btn-cta btn-cta-primary"
              onClick={handleHeaderCta}
              disabled={loading || (!hasProjects && projectLimitReached)}
              style={{ minHeight: '48px', padding: '0 20px', gap: '8px', display: 'inline-flex', alignItems: 'center' }}
            >
              <FiPlus aria-hidden="true" />
              <span>{hasProjects ? 'Publicar anuncio' : 'Crear mi primer proyecto'}</span>
            </button>
          </div>
        </header>

        {/* Métricas */}
        <section aria-label="Métricas del emprendedor" className="metrics-scroll-container">
          <StatsCard
            label="Me gusta"
            value={metrics.total_likes}
            icon={<FiHeart aria-hidden="true" />}
          />
          <StatsCard
            label="Calificación Promedio"
            value={avgRatingLabel}
            icon={<FiStar aria-hidden="true" />}
          />
          <StatsCard
            label="Total Anuncios"
            value={metrics.total_announcements}
            icon={<FiFileText aria-hidden="true" />}
          />
        </section>

        {/* Aviso de anuncios por vencer / vencidos */}
        {showExpiryBanner && (
          <div
            role="status"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
              padding: '12px 16px',
              marginBottom: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: bannerTone.background,
              border: `1px solid ${bannerTone.color}`,
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-primary)' }}>
              <FiAlertTriangle style={{ color: bannerTone.color, flexShrink: 0 }} aria-hidden="true" />
              <span>{alertParts.join(' · ')}</span>
            </span>
            <button
              type="button"
              className="btn-cta btn-cta-outline btn-cta-sm"
              onClick={() => setActiveTab(TABS.ANNOUNCEMENTS)}
              style={{ minHeight: '40px', padding: '0 14px' }}
            >
              Revisar
            </button>
          </div>
        )}

        {/* Navegación por pestañas */}
        <ChipNav
          options={tabOptions}
          activeValue={activeTab}
          onChange={setActiveTab}
        />

        {/* Contenido dinámico según pestaña activa */}
        <section className="dashboard-tab-content">
          {activeTab === TABS.PROJECTS && (
            <ProjectsTab
              projects={projects}
              loading={loading}
              loadError={loadError}
              busyProjectIds={busyProjectIds}
              onRetry={fetchProjects}
              isCreating={isCreatingProject}
              onStartCreate={() => setIsCreatingProject(true)}
              onCancelCreate={() => setIsCreatingProject(false)}
              onToggleStatus={handleToggleProjectStatus}
              onRequestDelete={handleOpenDeleteProject}
              onEditProject={handleOpenEditProject}
              onEditAnnouncement={handleOpenEditAnnouncement}
              onDeleteAnnouncement={handleOpenDeleteAnnouncement}
              projectAnnouncements={projectAnnouncements}
              loadingAnnouncements={loadingAnnouncements}
              onLoadAnnouncements={handleLoadProjectAnnouncements}
              activeProjectsCount={activeProjectsCount}
              projectLimitReached={projectLimitReached}
              newProject={newProject}
              onChangeNewProject={setNewProject}
              creatingProject={creatingProject}
              onSubmitProject={handleCreateProject}
            />
          )}

          {activeTab === TABS.ANNOUNCEMENTS && (
            <AnnouncementsTab
              announcements={allAnnouncements}
              projects={projects}
              loading={loading}
              announcementsLoading={announcementsLoading}
              loadError={loadError}
              onRetry={fetchProjects}
              isCreating={isCreatingAnnouncement}
              onStartCreate={() => setIsCreatingAnnouncement(true)}
              onCancelCreate={() => setIsCreatingAnnouncement(false)}
              onCreateProject={() => {
                setActiveTab(TABS.PROJECTS);
                setIsCreatingProject(true);
              }}
              onEditAnnouncement={handleOpenEditAnnouncement}
              onDeleteAnnouncement={handleOpenDeleteAnnouncement}
              newAnnouncement={newAnnouncement}
              onChangeNewAnnouncement={setNewAnnouncement}
              selectedProject={selectedProject}
              onSelectProject={setSelectedProject}
              creatingAnnouncement={creatingAnnouncement}
              onSubmitAnnouncement={handleCreateAnnouncement}
            />
          )}

          {activeTab === TABS.NOTIFICATIONS && (
            <NotificationsPanel
              notifications={notifications}
              unreadCount={unreadCount}
              loading={notificationsLoading}
              error={notificationsError}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onRetry={handleRetryNotifications}
            />
          )}

          {activeTab === TABS.PROFILE && (
            <ProfileTab
              user={user}
              onProfileUpdated={(updatedUser) => {
                if (updateUser) {
                  updateUser(updatedUser);
                }
              }}
            />
          )}
        </section>
      </main>

      {/* Modal de edición de proyectos */}
      <ProjectEditModal
        isOpen={Boolean(projectToEdit)}
        project={projectToEdit}
        onClose={handleCloseEditProject}
        onSave={handleSaveEditProject}
        busy={editingProject}
      />

      {/* Modal de edición de anuncios */}
      <AnnouncementEditModal
        isOpen={Boolean(announcementToEdit)}
        announcement={announcementToEdit}
        onClose={handleCloseEditAnnouncement}
        onSave={handleSaveEditAnnouncement}
        busy={editingAnnouncement}
      />

      {/* Modal de confirmación para eliminar anuncios */}
      <ConfirmModal
        isOpen={Boolean(announcementToDelete)}
        title="Eliminar anuncio"
        message={
          announcementToDelete ? (
            <>
              ¿Estás seguro de que deseas eliminar el anuncio
              {' '}
              <strong>“{announcementToDelete.title}”</strong>
              ? Esta acción no se puede deshacer.
            </>
          ) : (
            ''
          )
        }
        cancelLabel="Volver"
        confirmLabel="Sí, eliminar anuncio"
        busyLabel="Eliminando…"
        busy={deletingAnnouncement}
        onClose={handleCloseDeleteAnnouncement}
        onConfirm={handleConfirmDeleteAnnouncement}
      />

      {/* Modal de confirmación para eliminar proyectos */}
      <ConfirmModal
        isOpen={Boolean(projectToDelete)}
        title="Eliminar proyecto"
        message={
          projectToDelete ? (
            <>
              ¿Estás seguro de que deseas eliminar <strong>“{projectToDelete.name}”</strong>?
              Esta acción eliminará todos sus anuncios y no se puede deshacer.
            </>
          ) : (
            ''
          )
        }
        cancelLabel="Volver"
        confirmLabel="Sí, eliminar proyecto"
        busyLabel="Eliminando…"
        busy={deletingProject}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDeleteProject}
      />
    </div>
  );
}
