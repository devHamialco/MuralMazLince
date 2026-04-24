import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import CategoryBadge from '../components/CategoryBadge';
import StatusBadge from '../components/StatusBadge';
import ImageUploader from '../components/ImageUploader';

const CATEGORIES = [
  'Alimentos y bebidas', 'Repostería y postres', 'Artesanías y manualidades',
  'Ropa y accesorios', 'Papelería y material escolar', 'Cosméticos y cuidado personal',
  'Plantas y decoración', 'Asesorías académicas y tutorías', 'Diseño gráfico y digital',
  'Fotografía y video', 'Desarrollo web y tecnología', 'Clases particulares',
  'Impresión y copiado', 'Reparaciones y mantenimiento', 'Evento cultural',
  'Evento deportivo', 'Convocatoria o concurso', 'Comunicado oficial',
  'Actividad de voluntariado', 'Otro',
];

export default function EntrepreneurDashboard() {
  const { user, logout } = useAuth();
  const { showToast, notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
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

  useEffect(() => {
    loadProjects();
    loadNotifications();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await api.getProjects();
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      showToast('Error al cargar proyectos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await api.getNotifications();
      // Las notificaciones se cargan desde el contexto
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

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
    if (!confirm('¿Estás seguro de eliminar este proyecto y todos sus anuncios?')) return;
    
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
    setNewAnnouncement(prev => ({ ...prev, image: file, imagePreview: preview }));
  };

  const handleLogout = async () => {
    await api.logout();
    navigate('/');
  };

  return (
    <div className="entrepreneur-dashboard">
      {/* Navbar */}
      <nav 
        className="navbar navbar-dark"
        style={{ 
          backgroundColor: 'var(--bg-surface)', 
          borderBottom: '1px solid var(--bg-elevated)',
        }}
      >
        <div className="container-fluid">
          <Link 
            className="navbar-brand" 
            to="/"
            style={{ color: 'var(--primary)', fontWeight: 700 }}
          >
            Mural Maz Lince
          </Link>
          
          <div className="d-flex align-items-center gap-3">
            {/* Notificaciones */}
            <div className="position-relative">
              <button 
                className="btn btn-link text-light position-relative"
                onClick={() => setActiveTab('notifications')}
                style={{ textDecoration: 'none' }}
              >
                🔔
                {unreadCount > 0 && (
                  <span 
                    className="position-absolute"
                    style={{
                      top: '0',
                      right: '0',
                      backgroundColor: 'var(--error)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
            
            <span style={{ color: 'var(--text-secondary)' }}>
              {user?.display_name || user?.matricula}
            </span>
            
            <button 
              className="btn btn-link text-light"
              onClick={handleLogout}
              style={{ textDecoration: 'none' }}
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 mb-4">
            <div 
              className="list-group"
              style={{ 
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--border-radius-lg)',
                overflow: 'hidden',
              }}
            >
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'projects' ? 'active' : ''}`}
                onClick={() => setActiveTab('projects')}
                style={{
                  backgroundColor: activeTab === 'projects' ? 'var(--primary)' : 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                }}
              >
                Mis Proyectos
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'create' ? 'active' : ''}`}
                onClick={() => {
                  setShowCreateProject(true);
                  setActiveTab('create');
                }}
                style={{
                  backgroundColor: activeTab === 'create' ? 'var(--primary)' : 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                }}
              >
                Nuevo Proyecto
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
                style={{
                  backgroundColor: activeTab === 'notifications' ? 'var(--primary)' : 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                }}
              >
                Notificaciones {unreadCount > 0 && `(${unreadCount})`}
              </button>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="col-md-9">
            {/* Proyectos */}
            {activeTab === 'projects' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Mis Proyectos</h4>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setShowCreateAnnouncement(true);
                      setActiveTab('create-announcement');
                    }}
                    disabled={projects.filter(p => p.status === 'active').length >= 5}
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    + Nuevo Anuncio
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" />
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">No tienes proyectos aún</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowCreateProject(true)}
                      style={{ backgroundColor: 'var(--primary)' }}
                    >
                      Crear mi primer proyecto
                    </button>
                  </div>
                ) : (
                  <div className="row">
                    {projects.map(project => (
                      <div key={project.id} className="col-12 col-md-6 mb-4">
                        <div 
                          className="card h-100"
                          style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--bg-elevated)',
                            borderRadius: 'var(--border-radius-lg)',
                          }}
                        >
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h5 className="card-title" style={{ color: 'var(--text-primary)', margin: 0 }}>
                                {project.name}
                              </h5>
                              <StatusBadge status={project.status} />
                            </div>
                            
                            <p className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>
                              {project.description || 'Sin descripción'}
                            </p>
                            
                            <div className="mb-3">
                              <CategoryBadge category={project.category_name || 'Sin categoría'} />
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                                {project.announcements_count || 0} anuncios
                              </span>
                              
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => handleToggleProjectStatus(project.id, project.status)}
                                >
                                  {project.status === 'active' ? 'Suspender' : 'Activar'}
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteProject(project.id)}
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
                className="card"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--bg-elevated)',
                  borderRadius: 'var(--border-radius-lg)',
                }}
              >
                <div className="card-body">
                  <h5 className="mb-4" style={{ color: 'var(--text-primary)' }}>Nuevo Proyecto</h5>
                  
                  <form onSubmit={handleCreateProject}>
                    <div className="mb-3">
                      <label className="form-label" style={{ color: 'var(--text-secondary)' }}>
                        Nombre del proyecto
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={newProject.name}
                        onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                        required
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--bg-hover)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label" style={{ color: 'var(--text-secondary)' }}>
                        Descripción
                      </label>
                      <textarea
                        className="form-control"
                        value={newProject.description}
                        onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--bg-hover)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="form-label" style={{ color: 'var(--text-secondary)' }}>
                        Categoría
                      </label>
                      <select
                        className="form-select"
                        value={newProject.category}
                        onChange={(e) => setNewProject(prev => ({ ...prev, category: e.target.value }))}
                        required
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--bg-hover)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <option value="">Selecciona una categoría</option>
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--primary)' }}>
                        Crear Proyecto
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setShowCreateProject(false)}
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
                className="card"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--bg-elevated)',
                  borderRadius: 'var(--border-radius-lg)',
                }}
              >
                <div className="card-body">
                  <h5 className="mb-4" style={{ color: 'var(--text-primary)' }}>Nuevo Anuncio</h5>
                  
                  <form onSubmit={handleCreateAnnouncement}>
                    <div className="mb-3">
                      <label className="form-label" style={{ color: 'var(--text-secondary)' }}>
                        Proyecto
                      </label>
                      <select
                        className="form-select"
                        value={selectedProject || ''}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        required
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--bg-hover)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <option value="">Selecciona un proyecto</option>
                        {projects.filter(p => p.status === 'active').map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label" style={{ color: 'var(--text-secondary)' }}>
                        Título
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={newAnnouncement.title}
                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                        required
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--bg-hover)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label" style={{ color: 'var(--text-secondary)' }}>
                        Descripción
                      </label>
                      <textarea
                        className="form-control"
                        value={newAnnouncement.description}
                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        required
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--bg-hover)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label" style={{ color: 'var(--text-secondary)' }}>
                        Categoría
                      </label>
                      <select
                        className="form-select"
                        value={newAnnouncement.category}
                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, category: e.target.value }))}
                        required
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--bg-hover)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <option value="">Selecciona una categoría</option>
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label" style={{ color: 'var(--text-secondary)' }}>
                        Imagen
                      </label>
                      <ImageUploader
                        onImageChange={handleImageChange}
                        initialImage={newAnnouncement.imagePreview}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="form-label" style={{ color: 'var(--text-secondary)' }}>
                        Fecha de vencimiento (opcional)
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={newAnnouncement.expires_at}
                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, expires_at: e.target.value }))}
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--bg-hover)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>
                    
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--primary)' }}>
                        Publicar Anuncio
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setShowCreateAnnouncement(false)}
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
                    <span className="badge bg-primary" style={{ backgroundColor: 'var(--primary)', color: 'var(--text-primary)' }}>
                      {unreadCount}
                    </span>
                  )}
                  <button className="btn btn-sm btn-outline-secondary" onClick={markAllAsRead}>
                    Marcar todas como leídas
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-muted">No tienes notificaciones</p>
                ) : (
                  <div className="list-group">
                    {notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`list-group-item ${notif.read ? '' : 'bg-light'}`}
                        onClick={() => markAsRead(notif.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <span style={{ fontSize: '18px' }} aria-label="notif-icon">{notif.type === 'approved' ? '✓' : notif.type === 'review' ? '⏳' : notif.type === 'warning' ? '⚠' : '✗'}</span>
                            <span style={{ color: 'var(--text-primary)' }}>{notif.message}</span>
                          </div>
                          <span className="text-muted" style={{ fontSize: '12px' }}>{new Date(notif.created_at).toLocaleString('es-MX')}</span>
                        </div>
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
