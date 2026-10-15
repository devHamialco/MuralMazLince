// Feed.jsx - Página principal del mural de anuncios
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Navbar from '../components/Navbar';
import AnnouncementCard from '../components/AnnouncementCard';
import CategoryBadge from '../components/CategoryBadge';
import ReportModal from '../components/ReportModal';
import { CATEGORIES } from '../constants/categories';

export default function Feed() {
  const { isAuthenticated } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [reportedAnnouncements, setReportedAnnouncements] = useState(new Set());

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportAnnouncementId, setReportAnnouncementId] = useState(null);
  const loadMoreRef = useRef(null);

  // Cargar anuncios
  const loadAnnouncements = useCallback(
    async (cursorParam = null, category = null, reset = false) => {
      try {
        if (reset) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const response = await api.getAnnouncements(cursorParam, category);
        const { announcements: newAnnouncements, nextCursor } = response.data;

        if (reset) {
          setAnnouncements(newAnnouncements);
        } else {
          setAnnouncements((prev) => [...prev, ...newAnnouncements]);
        }

        setCursor(nextCursor);
        setHasMore(!!nextCursor);
      } catch (error) {
        console.error('Error loading announcements:', error);
        if (reset) setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadAnnouncements(null, selectedCategory, true);
  }, [loadAnnouncements, selectedCategory]);

  // Infinite scroll - wireframes-spec:151-155
  useEffect(() => {
    let observer;
    if (!loading && hasMore) {
      observer = new IntersectionObserver(
        (entries) => {
          // Cargar más cuando llegue al 80% del scroll (WF-3.1.1)
          if (entries[0].isIntersecting && !loadingMore && hasMore) {
            loadAnnouncements(cursor, selectedCategory);
          }
        },
        { threshold: 0.8 },
      );

      if (loadMoreRef.current) {
        observer.observe(loadMoreRef.current);
      }
    }

    return () => observer?.disconnect();
  }, [loading, loadingMore, hasMore, cursor, selectedCategory, loadAnnouncements]);

  const handleLike = async (announcementId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const response = await api.toggleLike(announcementId);
      const { liked } = response.data;

      setAnnouncements((prev) => prev.map((a) => {
        if (a.id === announcementId) {
          const currentLikes = Number(a.likes_count) || 0;
          const newLikesCount = liked ? currentLikes + 1 : Math.max(0, currentLikes - 1);
          return { ...a, likes_count: newLikesCount, user_liked: liked };
        }
        return a;
      }));
    } catch (error) {
      showToast('Error al dar like', 'error');
    }
  };

  const handleInteractionAttempt = () => {
    navigate('/login');
  };

  const handleReport = (announcementId) => {
    if (!isAuthenticated) return;
    setReportAnnouncementId(announcementId);
    setReportModalOpen(true);
  };

  const handleSubmitReport = async (announcementId, reason) => {
    try {
      await api.reportAnnouncement(announcementId, reason);
      setReportedAnnouncements((prev) => new Set([...prev, announcementId]));
      showToast('Reporte enviado', 'success');
    } catch (error) {
      if (error.status === 409) {
        setReportedAnnouncements((prev) => new Set([...prev, announcementId]));
        showToast('Ya enviaste un reporte para este anuncio', 'warning');
      } else {
        showToast('Error al enviar reporte', 'error');
      }
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory((prev) => (prev === category ? null : category));
  };

  let announcementsContent;
  if (loading) {
    announcementsContent = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        {[1, 2, 3].map((item) => (
          <div key={item}>
            <div className="skeleton" style={{ width: '100%', height: '257px', marginBottom: 'var(--spacing-sm)', borderRadius: 'var(--radius-lg)' }} />
            <div className="skeleton" style={{ width: '60%', height: '20px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '40%', height: '14px' }} />
          </div>
        ))}
      </div>
    );
  } else if (!announcements || announcements.length === 0) {
    announcementsContent = (
      <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl) var(--spacing-xl)', marginTop: 'var(--spacing-xl)' }}>
        <div style={{
          backgroundColor: 'var(--bg-card)',
          padding: 'var(--spacing-xl)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
        }}
        >
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: 'var(--spacing-md)' }}>
            No hay anuncios disponibles en este momento
          </p>
          {selectedCategory && (
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              Ver todas las categorías
            </button>
          )}
        </div>
      </div>
    );
  } else {
    announcementsContent = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
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
              isAuthenticated={isAuthenticated}
              onInteractionAttempt={handleInteractionAttempt}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="app-container bg-base">
      <Navbar />

      {/* Chips de categoría - wireframes-spec:614-628 */}
      {isAuthenticated && (
        <div
          style={{
            backgroundColor: 'var(--bg-base)',
            padding: 'var(--spacing-sm) 0',
            position: 'sticky',
            top: '90px',
            zIndex: 'var(--z-sticky)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing-sm)',
              overflowX: 'auto',
              padding: '0 var(--spacing-md)',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <CategoryBadge
              category="Todos"
              selected={!selectedCategory}
              clickable
              onClick={() => setSelectedCategory(null)}
            />
            {CATEGORIES.map((cat) => (
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
        {announcementsContent}

        {hasMore && !loading && (
          <div ref={loadMoreRef} style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0' }}>
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

        {!hasMore && announcements && announcements.length > 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', marginTop: 'var(--spacing-lg)' }}>
            Eso es todo amigos
          </p>
        )}
      </div>

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
