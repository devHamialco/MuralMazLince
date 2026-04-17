import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import AnnouncementCard from '../components/AnnouncementCard';
import CategoryBadge from '../components/CategoryBadge';
import ReportModal from '../components/ReportModal';

const CATEGORIES = [
  'Alimentos y bebidas', 'Repostería y postres', 'Artesanías y manualidades',
  'Ropa y accesorios', 'Papelería y material escolar', 'Cosméticos y cuidado personal',
  'Plantas y decoración', 'Asesorías académicas y tutorías', 'Diseño gráfico y digital',
  'Fotografía y video', 'Desarrollo web y tecnología', 'Clases particulares',
  'Impresión y copiado', 'Reparaciones y mantenimiento', 'Evento cultural',
  'Evento deportivo', 'Convocatoria o concurso', 'Comunicado oficial',
  'Actividad de voluntariado', 'Otro',
];

export default function Feed() {
  const { user, login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userInteractions, setUserInteractions] = useState({});
  const [reportedAnnouncements, setReportedAnnouncements] = useState(new Set());
  
  // Modal de reporte
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportAnnouncementId, setReportAnnouncementId] = useState(null);
  
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Cargar anuncios
  const loadAnnouncements = useCallback(async (cursorParam = null, category = null, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await api.getAnnouncements(cursorParam, category);
      const { announcements: newAnnouncements, next_cursor } = response.data;
      
      if (reset) {
        setAnnouncements(newAnnouncements);
      } else {
        setAnnouncements(prev => [...prev, ...newAnnouncements]);
      }
      
      setCursor(next_cursor);
      setHasMore(!!next_cursor);
    } catch (error) {
      console.error('Error loading announcements:', error);
      showToast('Error al cargar los anuncios', 'error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [showToast]);

  // Cargar interacciones del usuario
  const loadUserInteractions = useCallback(async () => {
    if (!user) return;
    
    try {
      // Obtener likes y ratings del usuario
      // Por ahora, almacenamos el estado localmente
    } catch (error) {
      console.error('Error loading interactions:', error);
    }
  }, [user]);

  useEffect(() => {
    loadAnnouncements(null, selectedCategory, true);
  }, [selectedCategory]);

  useEffect(() => {
    loadUserInteractions();
  }, [loadUserInteractions]);

  // Infinite scroll
  useEffect(() => {
    if (loading || !hasMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          loadAnnouncements(cursor, selectedCategory);
        }
      },
      { threshold: 0.1 }
    );
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    
    observerRef.current = observer;
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, loadingMore, hasMore, cursor, selectedCategory, loadAnnouncements]);

  // Handlers
  const handleLike = async (announcementId) => {
    if (!user) {
      showToast('Regístrate para dar like', 'info');
      navigate('/login');
      return;
    }
    
    try {
      const response = await api.toggleLike(announcementId);
      const { liked, likes_count } = response.data;
      
      setAnnouncements(prev =>
        prev.map(a => 
          a.id === announcementId 
            ? { ...a, likes_count, user_liked: liked }
            : a
        )
      );
    } catch (error) {
      showToast('Error al dar like', 'error');
    }
  };

  const handleReport = (announcementId) => {
    setReportAnnouncementId(announcementId);
    setReportModalOpen(true);
  };

  const handleSubmitReport = async (announcementId, reason) => {
    try {
      await api.reportAnnouncement(announcementId, reason);
      setReportedAnnouncements(prev => new Set([...prev, announcementId]));
      showToast('Reporte enviado correctamente', 'success');
    } catch (error) {
      if (error.status === 409) {
        setReportedAnnouncements(prev => new Set([...prev, announcementId]));
        showToast('Ya has reportado este anuncio', 'warning');
      } else {
        throw error;
      }
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(prev => prev === category ? null : category);
  };

  return (
    <div className="feed-page">
      {/* Navbar */}
      <nav 
        className="navbar navbar-dark sticky-top"
        style={{ 
          backgroundColor: 'var(--bg-surface)', 
          borderBottom: '1px solid var(--bg-elevated)',
          padding: 'var(--spacing-sm) var(--spacing-md)',
        }}
      >
        <div className="container-fluid">
          <Link 
            className="navbar-brand d-flex align-items-center gap-2" 
            to="/"
            style={{ color: 'var(--primary)' }}
          >
            <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>Mural Maz Lince</span>
          </Link>
          
          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                {user.role === 'entrepreneur' && (
                  <Link 
                    to="/dashboard" 
                    className="btn btn-outline-primary btn-sm"
                  >
                    Mi Panel
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="btn btn-outline-primary btn-sm"
                  >
                    Admin
                  </Link>
                )}
                <button 
                  className="btn btn-link text-light"
                  onClick={() => {
                    api.logout();
                    window.location.href = '/';
                  }}
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-link text-light">
                  Iniciar sesión
                </Link>
                <Link 
                  to="/register" 
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Filtros de categoría */}
      <div 
        className="category-filters py-2"
        style={{ 
          backgroundColor: 'var(--bg-base)',
          borderBottom: '1px solid var(--bg-elevated)',
          position: 'sticky',
          top: '56px',
          zIndex: 100,
        }}
      >
        <div className="container-fluid">
          <div 
            className="d-flex gap-2 overflow-auto py-1"
            style={{ scrollbarWidth: 'none' }}
          >
            <button
              className={`btn btn-sm ${!selectedCategory ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setSelectedCategory(null)}
              style={{
                backgroundColor: !selectedCategory ? 'var(--primary)' : 'transparent',
                borderColor: 'var(--bg-hover)',
                color: !selectedCategory ? 'white' : 'var(--text-secondary)',
                whiteSpace: 'nowrap',
              }}
            >
              Todos
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => handleCategoryClick(cat)}
                style={{
                  backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'transparent',
                  borderColor: 'var(--bg-hover)',
                  color: selectedCategory === cat ? 'white' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="container-fluid py-3" style={{ paddingBottom: '80px' }}>
        {loading ? (
          // Skeleton loading
          <div className="skeleton-container">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className="card mb-3 skeleton"
                style={{ height: '320px' }}
              />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">No hay anuncios disponibles</p>
            {selectedCategory && (
              <button 
                className="btn btn-link"
                onClick={() => setSelectedCategory(null)}
              >
                Ver todos los anuncios
              </button>
            )}
          </div>
        ) : (
          <div className="row">
            <div className="col-12 col-md-6 col-lg-4">
              {announcements.map((announcement, index) => (
                <div 
                  key={announcement.id}
                  className="fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <AnnouncementCard
                    announcement={announcement}
                    onLike={handleLike}
                    onReport={handleReport}
                    userLiked={announcement.user_liked}
                    userRating={announcement.user_rating}
                    isAuthenticated={!!user}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Load more trigger */}
        {hasMore && !loading && (
          <div 
            ref={loadMoreRef} 
            className="text-center py-3"
          >
            {loadingMore && (
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando más...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de reporte */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setReportAnnouncementId(null);
        }}
        onSubmit={handleSubmitReport}
        announcementId={reportAnnouncementId}
        alreadyReported={reportedAnnouncements.has(reportAnnouncementId)}
      />
    </div>
  );
}