/* AnnouncementDetail - wireframes-spec.md WF-3.1.2 */
/* Referencia: DDC, wireframes-spec.md */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiStar, FiHeart, FiMessageCircle, FiLock, FiCalendar, FiAlertTriangle } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import CategoryBadge from '../components/CategoryBadge';
import StarRating from '../components/StarRating';
import LikeButton from '../components/LikeButton';
import StatusBadge from '../components/StatusBadge';
import ReportModal from '../components/ReportModal';

export default function AnnouncementDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLiked, setUserLiked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReported, setUserReported] = useState(false);
  
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    loadAnnouncement();
  }, [id]);

  const loadAnnouncement = async () => {
    try {
      setLoading(true);
      const response = await api.getAnnouncement(id);
      const data = response.data;
      setAnnouncement(data.announcement);
      
      if (isAuthenticated) {
        setUserLiked(data.user_liked || false);
        setUserRating(data.user_rating || 0);
        setUserReported(data.user_reported || false);
      }
    } catch (err) {
      console.error('Error loading announcement:', err);
      setError('Anuncio no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }
    
    try {
      const response = await api.toggleLike(id);
      const { liked } = response.data;
      setUserLiked(liked);
      setAnnouncement(prev => {
        const currentLikes = Number(prev.likes_count) || 0;
        const newLikesCount = liked ? currentLikes + 1 : Math.max(0, currentLikes - 1);
        return { ...prev, likes_count: newLikesCount };
      });
    } catch (err) {
      showToast('Error al dar like', 'error');
    }
  };

  const handleRating = async (rating) => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }
    
    try {
      if (rating === userRating) {
        await api.removeRating(id);
        setUserRating(0);
      } else {
        await api.setRating(id, rating);
        setUserRating(rating);
      }
      loadAnnouncement();
    } catch (err) {
      showToast('Error al valorar', 'error');
    }
  };

  const handleSubmitReport = async (announcementId, reason) => {
    try {
      await api.reportAnnouncement(announcementId, reason);
      setUserReported(true);
      showToast('Reporte enviado', 'success');
    } catch (err) {
      if (err.status === 409) {
        setUserReported(true);
        showToast('Ya enviaste un reporte para este anuncio', 'warning');
      } else {
        showToast('Error al enviar reporte', 'error');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const isExpiringSoon = (expiresAt) => {
    if (!expiresAt) return false;
    const daysLeft = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 && daysLeft > 0;
  };

  if (loading) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: 'var(--bg-base)',
        }}
      >
        <div 
          style={{ 
            width: '32px', 
            height: '32px', 
            border: '3px solid var(--border)', 
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} 
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', padding: 'var(--spacing-md)' }}>
        <Link 
          to="/" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            color: 'var(--text-primary)',
            padding: 'var(--spacing-sm)',
            marginBottom: 'var(--spacing-md)',
          }}
        >
          <FiArrowLeft size={20} />
          Volver al Mural
        </Link>
        <h2 style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 'var(--spacing-xl)' }}>
          {error || 'Anuncio no encontrado'}
        </h2>
        <Link 
          to="/" 
          className="btn-cta btn-cta-primary"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'var(--spacing-lg) auto', width: '200px' }}
        >
          Volver al feed
        </Link>
      </div>
    );
  }

  const { 
    image_url, 
    title,
    project_name,
    description, 
    category, 
    display_name,
    whatsapp_link,
    likes_count = 0,
    average_rating,
    status,
    created_at,
    expires_at,
  } = announcement;

  // wireframes-spec: WF-3.1.2 - Header
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      {/* Header de navegación - wireframes-spec:165-169 */}
      <nav
        style={{
          backgroundColor: 'var(--bg-surface)',
          height: '56px',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--z-sticky)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 var(--spacing-md)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Link 
          to="/"
        >
          <img src="/icons/icon-512.png" alt="Mural Maz Lince" style={{ width: '48px', height: '48px', objectFit: 'cover' }} />
        </Link>
      </nav>

      {/* Imagen principal - wireframes-spec:173-178 */}
      <div style={{ width: '375px', height: '250px', position: 'relative' }}>
        {image_url ? (
          <img
            src={image_url}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
        ) : (
          <div 
            style={{ 
              width: '100%', 
              height: '100%', 
              backgroundColor: 'var(--bg-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
          >
            Sin imagen
          </div>
        )}
      </div>

      {/* Bloque de información principal - wireframes-spec:182-198 */}
      <div style={{ padding: 'var(--spacing-md)' }}>
        {/* Título */}
        <h1 
          style={{ 
            fontSize: '24px', 
            fontWeight: 700, 
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-sm)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </h1>
        
        {/* Nombre del proyecto + badge */}
        <div className="d-flex align-items-center gap-2" style={{ marginBottom: 'var(--spacing-sm)' }}>
          <span style={{ fontSize: '16px', color: 'var(--secondary)' }}>
            {project_name}
          </span>
          <CategoryBadge category={category} />
        </div>

        {/* Nombre del emprendedor */}
        <div className="d-flex align-items-center" style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 'var(--spacing-md)' }}>
          <FiUser size={16} style={{ marginRight: '4px' }} />
          <span>{display_name}</span>
        </div>

        {/* Bloque de métricas - wireframes-spec:201-207 */}
        <div 
          style={{ 
            display: 'flex', 
            gap: '24px', 
            justifyContent: 'center',
            padding: '12px 0',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            marginBottom: 'var(--spacing-md)',
          }}
        >
          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FiStar size={16} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
              {average_rating ? average_rating.toFixed(1) : '0.0'}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              ({announcement.ratings_count || 0} valoraciones)
            </span>
          </div>
          
          {/* Likes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FiHeart size={16} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
              {likes_count}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>me gusta</span>
          </div>
        </div>

        {/* Descripción - wireframes-spec:210-213 */}
        <div 
          style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '16px',
            marginBottom: 'var(--spacing-md)',
          }}
        >
          {description}
        </div>

        {/* Fecha de vigencia - wireframes-spec:217-223 */}
        {expires_at && (
          <div 
            className="d-flex align-items-center gap-2" 
            style={{ 
              fontSize: '14px', 
              color: isExpiringSoon(expires_at) ? 'var(--accent)' : 'var(--text-muted)',
              marginBottom: 'var(--spacing-md)',
            }}
          >
            <FiCalendar size={16} />
            <span>Válido hasta: {formatDate(expires_at)}</span>
            {isExpiringSoon(expires_at) && (
              <FiAlertTriangle size={16} />
            )}
          </div>
        )}

        {/* Bloque de contacto - wireframes-spec:227-233 */}
        {isAuthenticated && whatsapp_link ? (
          <a
            href={whatsapp_link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta"
            style={{
              width: '100%',
              height: '44px',
              backgroundColor: '#25D366',
              color: 'var(--text-primary)',
              marginBottom: 'var(--spacing-md)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
            }}
          >
            Contactar por WhatsApp
          </a>
        ) : (
          <div 
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--border)', 
              padding: 'var(--spacing-md)',
              marginBottom: 'var(--spacing-md)',
              textAlign: 'center',
            }}
          >
            <FiLock size={24} style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }} />
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
              Inicia sesión para ver los datos de contacto
            </p>
            <Link 
              to="/register"
              className="btn-cta btn-cta-primary"
              style={{
                width: '100%',
                height: '44px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Crear cuenta o iniciar sesión
            </Link>
          </div>
        )}

        {/* Botón de reporte - wireframes-spec:237-239 - Solo para ROL-02 y ROL-03 */}
        {isAuthenticated && user?.role !== 'visitor_registered' && (
          <button
            onClick={() => setReportModalOpen(true)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: 'var(--spacing-md)',
            }}
          >
            <FiMessageCircle size={16} />
            {userReported ? 'Reporte enviado' : 'Reportar anuncio'}
          </button>
        )}

        {/* Interacciones para usuario autenticado */}
        {isAuthenticated && (
          <div 
            style={{ 
              marginTop: 'var(--spacing-lg)',
              padding: 'var(--spacing-md)',
              borderTop: '1px solid var(--border)',
            }}
          >
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
              Valora este anuncio:
            </p>
            <div className="d-flex align-items-center gap-3">
              <div>
                <LikeButton liked={userLiked} count={likes_count} onClick={handleLike} />
              </div>
              <div>
                <StarRating value={userRating} onChange={handleRating} size={20} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de reporte */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSubmit={handleSubmitReport}
        announcementId={id}
        alreadyReported={userReported}
      />
    </div>
  );
}