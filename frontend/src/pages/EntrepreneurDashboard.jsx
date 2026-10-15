import { useState, useEffect, useCallback } from 'react';
import { FiHeart, FiStar, FiFileText } from 'react-icons/fi';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import Navbar from '../components/Navbar';
import CategoryBadge from '../components/CategoryBadge';
import StatusBadge from '../components/StatusBadge';
import ImageUploader from '../components/ImageUploader';
import StatsCard from '../components/StatsCard';
import ChipNav from '../components/ChipNav';
import { CATEGORIES } from '../constants/categories';

const notificationIcons = {
  approved: '✓',
  review: '⏳',
  warning: '⚠',
};

export default function EntrepreneurDashboard() {
  const {
    showToast,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loadNotifications,
  } = useNotification();

  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [metrics, setMetrics] = useState({ total_likes: 0, avg_rating: 0, total_announcements: 0 });

  // Formularios
  const [newProject, setNewProject] = useState({ name: '', description: '', category: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    description: '',
    category: '',
    image: null,
    imagePreview: null,
    expires_at: '',
  });

  const loadMetrics = useCallback(async () => {
    try {
      const response = await api.getMetrics();
      setMetrics(response.data.metrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getProjects();
      setProjects(response.data.projects || []);
      await loadMetrics();
    } catch (error) {
      console.error('Error loading projects:', error);
      showToast('Error al cargar proyectos', 'error');
    } finally {
      setLoading(false);
    }
  }, [loadMetrics, showToast]);

  const loadNotificationsFromContext = useCallback(async () => {
    if (loadNotifications) {
      await loadNotifications();
    }
  }, [loadNotifications]);

  useEffect(() => {
    loadProjects();
    loadNotificationsFromContext();
  }, [loadProjects, loadNotificationsFromContext]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.createProject(newProject);
      showToast('Proyecto creado correctamente', 'success');
      setShowCreateProject(false);
      setActiveTab('projects');
      setNewProject({ name: '', description: '', category: '' });
      loadProjects();
    } catch (error) {
      if (error.status === 409) {
        showToast('Has alcanzado el límite de 5 proyectos activos', 'warning');
      } else {
        showToast('Error al crear proyecto', 'error');
      }
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.image || !selectedProject) {
      showToast('Selecciona una imagen y un proyecto', 'warning');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', newAnnouncement.title);
      formData.append('description', newAnnouncement.description);
      formData.append('custom_category', newAnnouncement.category);
      formData.append('image', newAnnouncement.image);
      if (newAnnouncement.expires_at) {
        formData.append('expires_at', newAnnouncement.expires_at);
      }
      formData.append('project_id', selectedProject);

      await api.createAnnouncement(formData);
      showToast('Anuncio creado correctamente', 'success');
      setShowCreateAnnouncement(false);
      setActiveTab('projects');
      setNewAnnouncement({
        title: '',
        description: '',
        category: '',
        image: null,
        imagePreview: null,
        expires_at: '',
      });
      setSelectedProject(null);
      loadProjects();
    } catch (error) {
      console.error('Error creating announcement:', error);
      showToast('Error al crear anuncio', 'error');
    }
  };

  const handleDeleteProject = async (projectId) => {
    // eslint-disable-next-line no-alert -- Keep a native confirmation before destructive deletion.
    if (!window.confirm('¿Estás seguro de eliminar este proyecto y todos sus anuncios?')) return;

    try {
      await api.deleteProject(projectId);
      showToast('Proyecto eliminado', 'success');
      loadProjects();
    } catch (error) {
      showToast('Error al eliminar proyecto', 'error');
    }
  };

  const handleToggleProjectStatus = async (projectId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.updateProjectStatus(projectId, newStatus);
      showToast(`Proyecto ${newStatus === 'active' ? 'activado' : 'suspendido'}`, 'success');
      loadProjects();
    } catch (error) {
      showToast('Error al actualizar proyecto', 'error');
    }
  };

  const handleImageChange = (file, preview) => {
    setNewAnnouncement((prev) => ({ ...prev, image: file, imagePreview: preview }));
  };

  return (
    <div className="entrepreneur-dashboard">
      <Navbar />

      <div className="container-fluid py-4">
        {/* Header Stats */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="row gap-3">
              <StatsCard label="Total Likes" value={metrics.total_likes} icon={<FiHeart />} />
              <StatsCard label="Calificación Promedio" value={metrics.avg_rating} icon={<FiStar />} />
              <StatsCard label="Total Anuncios" value={metrics.total_announcements} icon={<FiFileText />} />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="row mb-4">
          <div className="col-12">
            <ChipNav
              options={[
                { label: 'Mis Proyectos', value: 'projects' },
                { label: 'Nuevo Proyecto', value: 'create' },
                { label: 'Notificaciones', value: 'notifications' },
              ]}
              activeValue={activeTab}
              onChange={(val) => {
                setActiveTab(val);
                if (val === 'create') setShowCreateProject(true);
              }}
            />
          </div>
        </div>

        <div className="row">
          {/* Contenido principal */}
          <div className="col-12">
            {/* Proyectos */}
            {activeTab === 'projects' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Mis Proyectos</h4>
                  <button
                    type="button"
                    className="btn-cta"
                    onClick={() => {
                      setShowCreateAnnouncement(true);
                      setActiveTab('create-announcement');
                    }}
                    disabled={projects.filter((p) => p.status === 'active').length >= 5}
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--text-primary)',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    + Nuevo Anuncio
                  </button>
                </div>

                {loading && (
                  <div className="text-center py-5">
                    <div className="spinner-border" role="status" style={{ color: 'var(--primary)' }} />
                  </div>
                )}
                {!loading && projects.length === 0 && (
                  <div className="text-center py-5">
                    <p style={{ color: 'var(--text-secondary)' }}>No tienes proyectos aún</p>
                    <button
                      type="button"
                      className="btn-cta"
                      onClick={() => setShowCreateProject(true)}
                      style={{ backgroundColor: 'var(--primary)', color: 'var(--text-primary)', border: 'none', padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Crear mi primer proyecto
                    </button>
                  </div>
                )}
                {!loading && projects.length > 0 && (
                  <div className="row">
                    {projects.map((project) => (
                      <div key={project.id} className="col-12 col-md-6 mb-4">
                        <div
                          className="card card-mml h-100"
                          style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-lg)',
                          }}
                        >
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h5 className="card-title" style={{ color: 'var(--text-primary)', margin: 0 }}>
                                {project.name}
                              </h5>
                              <StatusBadge status={project.status} />
                            </div>

                            <p className="mb-2" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                              {project.description || 'Sin descripción'}
                            </p>

                            <div className="mb-3">
                              <CategoryBadge category={project.category_name || 'Sin categoría'} />
                            </div>

                            <div className="d-flex justify-content-between align-items-center">
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                {project.announcements_count || 0} anuncios
                              </span>

                              <div className="d-flex gap-2">
                                <button
                                  type="button"
                                  className="btn-cta-outline"
                                  onClick={() => handleToggleProjectStatus(
                                    project.id,
                                    project.status,
                                  )}
                                  style={{
                                    fontSize: '12px',
                                    padding: '4px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'transparent',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    transition: 'var(--transition-fast)',
                                  }}
                                >
                                  {project.status === 'active' ? 'Suspender' : 'Activar'}
                                </button>
                                <button
                                  type="button"
                                  className="btn-cta-outline"
                                  onClick={() => handleDeleteProject(project.id)}
                                  style={{
                                    fontSize: '12px',
                                    padding: '4px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'transparent',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    transition: 'var(--transition-fast)',
                                  }}
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Crear Proyecto */}
            {showCreateProject && (
            <div
              className="card card-mml"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div className="card-body">
                <h5 className="mb-4" style={{ color: 'var(--text-primary)' }}>Nuevo Proyecto</h5>

                <form onSubmit={handleCreateProject}>
                  <div className="mb-3">
                    <label htmlFor="project-name" className="form-label" style={{ color: 'var(--text-secondary)' }}>
                      Nombre del proyecto
                    </label>
                    <input
                      id="project-name"
                      type="text"
                      className="form-control"
                      value={newProject.name}
                      onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
                      required
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="project-description"
                      className="form-label"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Descripción
                    </label>
                    <textarea
                      id="project-description"
                      className="form-control"
                      value={newProject.description}
                      onChange={(event) => setNewProject((previous) => ({
                        ...previous,
                        description: event.target.value,
                      }))}
                      rows={3}
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="project-category" className="form-label" style={{ color: 'var(--text-secondary)' }}>
                      Categoría
                    </label>
                    <select
                      id="project-category"
                      className="form-select"
                      value={newProject.category}
                      onChange={(event) => setNewProject((previous) => ({
                        ...previous,
                        category: event.target.value,
                      }))}
                      required
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <option value="">Selecciona una categoría</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn-cta" style={{ backgroundColor: 'var(--primary)', color: 'var(--text-primary)', border: 'none', padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer' }}>
                      Crear Proyecto
                    </button>
                    <button
                      type="button"
                      className="btn-cta-outline"
                      onClick={() => setShowCreateProject(false)}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
            )}

            {/* Crear Anuncio */}
            {showCreateAnnouncement && (
            <div
              className="card card-mml"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div className="card-body">
                <h5 className="mb-4" style={{ color: 'var(--text-primary)' }}>Nuevo Anuncio</h5>

                <form onSubmit={handleCreateAnnouncement}>
                  <div className="mb-3">
                    <label htmlFor="announcement-project" className="form-label" style={{ color: 'var(--text-secondary)' }}>
                      Proyecto
                    </label>
                    <select
                      id="announcement-project"
                      className="form-select"
                      value={selectedProject || ''}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      required
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <option value="">Selecciona un proyecto</option>
                      {projects.filter((p) => p.status === 'active').map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="announcement-title"
                      className="form-label"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Título
                    </label>
                    <input
                      id="announcement-title"
                      type="text"
                      className="form-control"
                      value={newAnnouncement.title}
                      onChange={(event) => setNewAnnouncement((previous) => ({
                        ...previous,
                        title: event.target.value,
                      }))}
                      required
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="announcement-description" className="form-label" style={{ color: 'var(--text-secondary)' }}>
                      Descripción
                    </label>
                    <textarea
                      id="announcement-description"
                      className="form-control"
                      value={newAnnouncement.description}
                      onChange={(event) => setNewAnnouncement((previous) => ({
                        ...previous,
                        description: event.target.value,
                      }))}
                      rows={4}
                      required
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="announcement-category"
                      className="form-label"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Categoría
                    </label>
                    <select
                      id="announcement-category"
                      className="form-select"
                      value={newAnnouncement.category}
                      onChange={(event) => setNewAnnouncement((previous) => ({
                        ...previous,
                        category: event.target.value,
                      }))}
                      required
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <option value="">Selecciona una categoría</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <p className="form-label" style={{ color: 'var(--text-secondary)' }}>Imagen</p>
                    <ImageUploader
                      onImageChange={handleImageChange}
                      initialImage={newAnnouncement.imagePreview}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="announcement-expiry" className="form-label" style={{ color: 'var(--text-secondary)' }}>
                      Fecha de vencimiento (opcional)
                    </label>
                    <input
                      id="announcement-expiry"
                      type="date"
                      className="form-control"
                      value={newAnnouncement.expires_at}
                      onChange={(event) => setNewAnnouncement((previous) => ({
                        ...previous,
                        expires_at: event.target.value,
                      }))}
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn-cta" style={{ backgroundColor: 'var(--primary)', color: 'var(--text-primary)', border: 'none', padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer' }}>
                      Publicar Anuncio
                    </button>
                    <button
                      type="button"
                      className="btn-cta-outline"
                      onClick={() => setShowCreateAnnouncement(false)}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
            )}

            {/* Notificaciones (WF-3.4.4) - panel dedicado para el emprendedor */}
            {activeTab === 'notifications' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Notificaciones</h4>
                {unreadCount > 0 && (
                <span className="badge" style={{ backgroundColor: 'var(--primary)', color: 'var(--text-primary)' }}>
                  {unreadCount}
                </span>
                )}
                <button
                  type="button"
                  className="btn-cta-outline"
                  onClick={markAllAsRead}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                  }}
                >
                  Marcar todas como leídas
                </button>
              </div>
              {notifications.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No tienes notificaciones</p>
              ) : (
                <div className="row">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="col-12 mb-2">
                      <button
                        type="button"
                        className="card card-mml"
                        onClick={() => markAsRead(notif.id)}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          cursor: 'pointer',
                          backgroundColor: notif.is_read ? 'var(--bg-surface)' : 'var(--bg-elevated)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-lg)',
                          padding: 'var(--spacing-sm)',
                        }}
                      >
                        <span className="d-flex justify-content-between align-items-center">
                          <span className="d-flex align-items-center gap-2">
                            <span style={{ fontSize: '18px' }} aria-hidden="true">
                              {notificationIcons[notif.type] || '✗'}
                            </span>
                            <span style={{ color: 'var(--text-primary)' }}>{notif.message}</span>
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {new Date(notif.created_at).toLocaleString('es-MX')}
                          </span>
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
