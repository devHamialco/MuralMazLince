/* Feed - wireframes-spec.md WF-3.1.1 / WF-3.3.1 */
/* Referencia: DDC, wireframes-spec.md */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBell, FiLogOut } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import AnnouncementCard from '../components/AnnouncementCard';
import CategoryBadge from '../components/CategoryBadge';
import NotificationDot from '../components/NotificationDot';
import ReportModal from '../components/ReportModal';
import ToastNotification from '../components/ToastNotification';

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
  const { user, isAuthenticated, logout } = useAuth();
  const { showToast, toast, setToast } = useNotification();
  const navigate = useNavigate();
  
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [reportedAnnouncements, setReportedAnnouncements] = useState(new Set());
  
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportAnnouncementId, setReportAnnouncementId] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
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
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Cargar notificaciones
  const loadNotifications = useCallback(async () => {
    if (!user || user.role !== 'entrepreneur') return;
    
    try {
      const response = await api.getNotifications();
      const unread = response.data.notifications?.filter(n => !n.read_at) || [];
      setUnreadCount(unread.length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [user]);

  useEffect(() => {
    loadAnnouncements(null, selectedCategory, true);
  }, [selectedCategory]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Infinite scroll - wireframes-spec:151-155
  useEffect(() => {
    if (loading || !hasMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          loadAnnouncements(cursor, selectedCategory);
        }
      },
      { threshold: 0.2 }
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

  const handleLike = async (announcementId) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
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

  const handleInteractionAttempt = () => {
    setShowLoginPrompt(true);
  };

  const handleReport = (announcementId) => {
    if (!isAuthenticated) return;
    setReportAnnouncementId(announcementId);
    setReportModalOpen(true);
  };

  const handleSubmitReport = async (announcementId, reason) => {
    try {
      await api.reportAnnouncement(announcementId, reason);
      setReportedAnnouncements(prev => new Set([...prev, announcementId]));
      showToast('Reporte enviado', 'success');
    } catch (error) {
      if (error.status === 409) {
        setReportedAnnouncements(prev => new Set([...prev, announcementId]));
        showToast('Ya enviaste un reporte para este anuncio', 'warning');
      } else {
        showToast('Error al enviar reporte', 'error');
      }
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(prev => prev === category ? null : category);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="feed-page">
      {/* NavBar - wireframes-spec:57-63 */}
      <nav
        style={{
          backgroundColor: 'var(--bg-surface)',
          height: '56px',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--z-sticky)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--spacing-md)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <span style={{ fontSize: '20px' }}>
            <span style={{ color: 'var(--primary)' }}>◉</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}> M</span>
          </span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
            Mural Maz Lince
          </span>
        </Link>

        <div className="d-flex align-items-center gap-2">
          {isAuthenticated ? (
            <>
              {user?.role === 'entrepreneur' && (
                <Link to="/dashboard" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Mi Panel
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Admin
                </Link>
              )}
              {user?.role === 'entrepreneur' && (
                <Link to="/dashboard" style={{ position: 'relative', color: 'var(--text-primary)' }}>
                  <FiBell size={24} />
                  <NotificationDot count={unreadCount} />
                </Link>
              )}
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <FiLogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--text-primary)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Chips de categoría - wireframes-spec:614-628 */}
      {isAuthenticated && (
        <div
          style={{
            backgroundColor: 'var(--bg-base)',
            padding: 'var(--spacing-sm) 0',
            position: 'sticky',
            top: '56px',
            zIndex: 'var(--z-sticky)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div
            className="d-flex gap-2"
            style={{
              overflowX: 'auto',
              padding: '0 var(--spacing-md)',
              scrollbarWidth: 'none',
            }}
          >
            <CategoryBadge
              category="Todos"
              selected={!selectedCategory}
              clickable
              onClick={() => setSelectedCategory(null)}
            />
            {CATEGORIES.map(cat => (
              <CategoryBadge
                key={cat}
                category={cat}
                selected={selectedCategory === cat}
                clickable
                onClick={handleCategoryClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Feed - wireframes-spec:67-155 */}
      <div style={{ padding: 'var(--spacing-md)', paddingBottom: '80px' }}>
        {loading ? (
          <div>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ marginBottom: 'var(--spacing-md)' }}>
                <div className="skeleton" style={{ width: '343px', height: '257px', marginBottom: 'var(--spacing-sm)' }} />
                <div className="skeleton" style={{ width: '200px', height: '20px', marginBottom: '4px' }} />
                <div className="skeleton" style={{ width: '140px', height: '14px' }} />
              </div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <p style={{ color: 'var(--text-muted)' }}>No hay anuncios disponibles</p>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                }}
              >
                Ver todos los anuncios
              </button>
            )}
          </div>
        ) : (
          <div>
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
                  isAuthenticated={isAuthenticated}
                  onInteractionAttempt={handleInteractionAttempt}
                />
              </div>
            ))}
          </div>
        )}

        {/* Load more - wireframes-spec:151-155 */}
        {hasMore && !loading && (
          <div ref={loadMoreRef} style={{ textAlign: 'center', padding: 'var(--spacing-md)' }}>
            {loadingMore && (
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  border: '2px solid var(--border)',
                  borderTopColor: 'var(--primary)',
                  borderRadius: '50%',
                  margin: '0 auto',
                  animation: 'spin 1s linear infinite',
                }}
              />
            )}
          </div>
        )}

        {!hasMore && announcements.length > 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            Has llegado al final del mural.
          </p>
        )}
      </div>

      {/* CTA sticky para visitantes - wireframes-spec:124-134 */}
      {showLoginPrompt && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-surface)',
            backdropFilter: 'blur(8px)',
            borderTop: '1px solid var(--border)',
            padding: 'var(--spacing-md)',
            zIndex: 'var(--z-sticky)',
            animation: 'slideUp 200ms ease-out',
          }}
          onClick={() => {
            setShowLoginPrompt(false);
            navigate('/register');
          }}
        >
          <p style={{ textAlign: 'center', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, margin: 0 }}>
            Inicia sesión para interactuar
          </p>
        </div>
      )}

      {/* Report Modal - wireframes-spec: WF-3.3.2 */}
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

      {/* Toast - wireframes-spec:939-945 */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}