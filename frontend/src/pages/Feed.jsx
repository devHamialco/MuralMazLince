// Feed.jsx - Página principal del mural de anuncios
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Navbar from '../components/Navbar';
import AnnouncementCard, { AnnouncementCardSkeleton } from '../components/AnnouncementCard';
import CategoryBadge from '../components/CategoryBadge';
import ReportModal from '../components/ReportModal';
import { CATEGORIES, normalizeCategory } from '../constants/categories';

/**
 * Algoritmo Fisher-Yates (Knuth) para barajado uniforme e imparcial en memoria.
 * Garantiza O(n) y que cada anuncio tenga exactamente la misma probabilidad
 * de aparecer en cualquier posición del mural en cada carga.
 */
function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

export default function Feed() {
  const { isAuthenticated } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [allAnnouncements, setAllAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [reportedAnnouncements, setReportedAnnouncements] = useState(new Set());

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportAnnouncementId, setReportAnnouncementId] = useState(null);

  // Carga completa del catálogo de anuncios activos y barajado uniforme
  const fetchAllAndShuffle = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const response = await api.getAnnouncements(null, null, 500);
      const rawAnnouncements = response.data?.announcements || [];
      const shuffled = shuffleArray(rawAnnouncements);
      setAllAnnouncements(shuffled);
    } catch (error) {
      console.error('Error loading announcements:', error);
      setLoadError(true);
      showToast('Error al cargar el mural de anuncios', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAllAndShuffle();
  }, [fetchAllAndShuffle]);

  // Filtrado instantáneo en cliente por categoría seleccionada
  const displayedAnnouncements = useMemo(() => {
    let list = allAnnouncements.filter((a) => !reportedAnnouncements.has(a.id));
    if (selectedCategory) {
      const normalizedFilter = normalizeCategory(selectedCategory);
      list = list.filter((a) => {
        const cat = normalizeCategory(a.category || a.category_name || a.custom_category);
        return cat === normalizedFilter;
      });
    }
    return list;
  }, [allAnnouncements, selectedCategory, reportedAnnouncements]);

  const handleLike = async (announcementId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const response = await api.toggleLike(announcementId);
      const { liked } = response.data;

      setAllAnnouncements((prev) => prev.map((a) => {
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
          <AnnouncementCardSkeleton key={item} />
        ))}
      </div>
    );
  } else if (loadError) {
    announcementsContent = (
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--spacing-2xl) var(--spacing-xl)',
          marginTop: 'var(--spacing-xl)',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            padding: 'var(--spacing-xl)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
          }}
        >
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '16px',
              marginBottom: 'var(--spacing-md)',
            }}
          >
            No pudimos conectar con el mural
          </p>
          <button
            type="button"
            className="btn-cta btn-cta-primary btn-cta-sm"
            onClick={fetchAllAndShuffle}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  } else if (displayedAnnouncements.length === 0) {
    announcementsContent = (
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--spacing-2xl) var(--spacing-xl)',
          marginTop: 'var(--spacing-xl)',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            padding: 'var(--spacing-xl)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
          }}
        >
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '16px',
              marginBottom: 'var(--spacing-md)',
            }}
          >
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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-md)',
          marginTop: 'var(--spacing-md)',
        }}
      >
        {displayedAnnouncements.map((announcement, index) => (
          <div
            key={announcement.id}
            className="fade-in"
            style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
          >
            <AnnouncementCard
              announcement={announcement}
              onLike={handleLike}
              onReport={handleReport}
              userLiked={announcement.user_liked}
              isAuthenticated={isAuthenticated}
              onInteractionAttempt={handleInteractionAttempt}
              display_name={announcement.display_name || announcement.project_name || 'Emprendedor'}
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
            top: '70px',
            zIndex: 'var(--z-sticky)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing-sm)',
              overflowX: 'auto',
              padding: '4px var(--spacing-md)',
              scrollSnapType: 'x mandatory',
              scrollPadding: '0 var(--spacing-md)',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              maskImage: 'linear-gradient(to right, black calc(100% - 36px), transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, black calc(100% - 36px), transparent 100%)',
            }}
          >
            <CategoryBadge
              category="Todos"
              selected={!selectedCategory}
              clickable
              onClick={() => setSelectedCategory(null)}
            />
            {CATEGORIES.productos.map((cat) => (
              <CategoryBadge
                key={cat}
                category={cat}
                selected={selectedCategory === cat}
                clickable
                onClick={handleCategoryClick}
              />
            ))}
            {CATEGORIES.servicios.map((cat) => (
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

      {/* Feed principal */}
      <div style={{ padding: 'var(--spacing-md)', paddingBottom: '80px' }}>
        {announcementsContent}

        {!loading && !loadError && displayedAnnouncements.length > 0 && (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              marginTop: 'var(--spacing-xl)',
            }}
          >
            Has llegado al final de los anuncios
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
