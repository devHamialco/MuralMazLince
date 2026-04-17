import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLiked, setUserLiked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [alreadyReported, setAlreadyReported] = useState(false);
  
  // Modal de reporte
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    loadAnnouncement();
  }, [id]);

  const loadAnnouncement = async () => {
    try {
      setLoading(true);
      const response = await api.getAnnouncement(id);
      setAnnouncement(response.data);
      
      // Cargar estado del usuario
      if (user) {
        setUserLiked(response.data.user_liked || false);
        setUserRating(response.data.user_rating || 0);
        setAlreadyReported(response.data.user_reported || false);
      }
    } catch (err) {
      console.error('Error loading announcement:', err);
      setError('Anuncio no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      showToast('Regístrate para dar like', 'info');
      navigate('/login');
      return;
    }
    
    try {
      const response = await api.toggleLike(id);
      const { liked, likes_count } = response.data;
      setUserLiked(liked);
      setAnnouncement(prev => ({ ...prev, likes_count }));
    } catch (err) {
      showToast('Error al dar like', 'error');
    }
  };

  const handleRating = async (rating) => {
    if (!user) {
      showToast('Regístrate para valorar', 'info');
      navigate('/login');
      return;
    }
    
    try {
      if (rating === userRating) {
        // Quitar rating
        await api.removeRating(id);
        setUserRating(0);
      } else {
        // Establecer rating
        await api.setRating(id, rating);
        setUserRating(rating);
      }
      // Recargar para obtener el promedio actualizado
      loadAnnouncement();
    } catch (err) {
      showToast('Error al valorar', 'error');
    }
  };

  const handleSubmitReport = async (announcementId, reason) => {
    try {
      await api.reportAnnouncement(announcementId, reason);
      setAlreadyReported(true);
      showToast('Reporte enviado correctamente', 'success');
    } catch (err) {
      if (err.status === 409) {
        setAlreadyReported(true);
        showToast('Ya has reportado este anuncio', 'warning');
      } else {
        throw err;
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="text-center py-5">
        <h4 className="text-muted">{error || 'Anuncio no encontrado'}</h4>
        <Link to="/" className="btn btn-primary mt-3">
          Volver al feed
        </Link>
      </div>
    );
  }

  const { 
    image_url, 
    title, 
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

  return (
    <div className="announcement-detail-page">
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
            className="navbar-brand d-flex align-items-center gap-2" 
            to="/"
            style={{ color: 'var(--primary)' }}
          >
            ← Volver
          </Link>
        </div>
      </nav>

      <div className="container py-4">
        <div className="row">
          <div className="col-12 col-lg-8">
            {/* Imagen */}
            <div 
              className="announcement-image mb-4"
              style={{
                borderRadius: 'var(--border-radius-lg)',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-elevated)',
              }}
            >
              {image_url ? (
                <img 
                  src={image_url} 
                  alt={title}
                  style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }}
                />
              ) : (
                <div 
                  className="d-flex align-items-center justify-content-center"
                  style={{ height: '300px', color: 'var(--text-muted)' }}
                >
                  Sin imagen
                </div>
              )}
            </div>

            {/* Estado */}
            {status && status !== 'active' && (
              <div className="mb-3">
                <StatusBadge status={status} size="lg" />
              </div>
            )}

            {/* Título y categoría */}
            <h1 
              className="mb-2"
              style={{ 
                fontWeight: 700, 
                fontSize: '1.75rem',
                color: 'var(--text-primary)',
              }}
            >
              {title}
            </h1>
            
            <div className="mb-4">
              <CategoryBadge category={category} />
            </div>

            {/* Descripción */}
            <div 
              className="announcement-description mb-4"
              style={{ 
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}
            >
              {description}
            </div>

            {/* Fechas */}
            <div className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
              <p className="mb-1">Publicado el {formatDate(created_at)}</p>
              {expires_at && (
                <p className="mb-0">
                  Vence el {formatDate(expires_at)}
                </p>
              )}
            </div>
          </div>

          <div className="col-12 col-lg-4">
            {/* Sidebar */}
            <div 
              className="card"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--bg-elevated)',
                borderRadius: 'var(--border-radius-lg)',
                position: 'sticky',
                top: '80px',
              }}
            >
              <div className="card-body">
                {/* Emprendedor */}
                <div className="mb-4">
                  <h6 className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                    PUBLICADO POR
                  </h6>
                  <p 
                    className="mb-0"
                    style={{ 
                      color: 'var(--primary-light)', 
                      fontWeight: 600,
                      fontSize: '1.1rem',
                    }}
                  >
                    {display_name}
                  </p>
                </div>

                {/* WhatsApp */}
                {user && whatsapp_link ? (
                  <div className="mb-4">
                    <a
                      href={whatsapp_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn w-100"
                      style={{
                        backgroundColor: '#25D366',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    >
                      Contactar por WhatsApp
                    </a>
                  </div>
                ) : (
                  <div className="mb-4">
                    <button
                      className="btn w-100"
                      disabled
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        color: 'var(--text-muted)',
                        cursor: 'not-allowed',
                      }}
                    >
                      Inicia sesión para contactar
                    </button>
                  </div>
                )}

                {/* Interacciones */}
                <div 
                  className="interactions"
                  style={{ 
                    borderTop: '1px solid var(--bg-elevated)',
                    paddingTop: 'var(--spacing-md)',
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="text-muted">Likes</span>
                    <LikeButton 
                      liked={userLiked}
                      count={likes_count}
                      onToggle={handleLike}
                      disabled={!user}
                      size="lg"
                    />
                  </div>

                  <div className="d-flex align-items-center justify-content-between">
                    <span className="text-muted">Valoración</span>
                    <StarRating 
                      value={userRating}
                      onChange={handleRating}
                      readonly={!user}
                      size="lg"
                    />
                  </div>

                  {average_rating > 0 && (
                    <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.85rem' }}>
                      Promedio: {average_rating.toFixed(1)} / 3
                    </p>
                  )}
                </div>

                {/* Reporte */}
                {user && (
                  <div 
                    style={{ 
                      borderTop: '1px solid var(--bg-elevated)',
                      paddingTop: 'var(--spacing-md)',
                      marginTop: 'var(--spacing-md)',
                    }}
                  >
                    <button
                      className="btn btn-link w-100"
                      onClick={() => setReportModalOpen(true)}
                      style={{ 
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                      }}
                      disabled={alreadyReported}
                    >
                      {alreadyReported ? 'Ya reportado' : 'Reportar anuncio'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de reporte */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSubmit={handleSubmitReport}
        announcementId={id}
        alreadyReported={alreadyReported}
      />
    </div>
  );
}