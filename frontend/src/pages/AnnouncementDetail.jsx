/* AnnouncementDetail - Vista de detalle de anuncio para consumidores (v2: rediseño UX) */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiUser,
  FiStar,
  FiHeart,
  FiMessageCircle,
  FiCalendar,
  FiAlertTriangle,
  FiImage,
  FiInstagram,
  FiMapPin,
  FiFolder,
  FiFlag,
  FiChevronRight,
} from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Navbar from '../components/Navbar';
import CategoryBadge from '../components/CategoryBadge';
import StarRating from '../components/StarRating';
import LikeButton from '../components/LikeButton';
import ReportModal from '../components/ReportModal';
import EmptyState from '../components/EmptyState';

/* ---------- Estilos reutilizables ---------- */
const cardStyle = {
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: '20px',
  marginBottom: '16px',
};

const sectionLabelStyle = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--text-muted)',
  margin: '0 0 12px 0',
  fontWeight: 700,
};

const actionBase = {
  width: '100%',
  minHeight: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: '14px',
  borderRadius: 'var(--radius-md)',
};

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
  const [imgFailed, setImgFailed] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // silent = true recarga datos sin mostrar el spinner de pantalla completa
  const loadAnnouncement = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
          setImgFailed(false);
        }
        setError(null);
        const response = await api.getAnnouncement(id);
        const { data } = response;
        setAnnouncement(data.announcement);

        if (isAuthenticated) {
          setUserLiked(Boolean(data.user_liked));
          setUserRating(Number(data.user_rating) || 0);
          setUserReported(Boolean(data.user_reported));
        }
      } catch (err) {
        console.error('Error loading announcement:', err);
        setError('Anuncio no encontrado o no disponible');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [id, isAuthenticated],
  );

  useEffect(() => {
    loadAnnouncement();
  }, [loadAnnouncement]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const response = await api.toggleLike(id);
      const { liked } = response.data;
      setUserLiked(liked);
      setAnnouncement((prev) => {
        if (!prev) return prev;
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
      navigate('/login');
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
      loadAnnouncement(true); // recarga silenciosa: sin parpadeo
    } catch (err) {
      showToast(err.message || 'Error al valorar', 'error');
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
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysLeft = (expiresAt) => {
    if (!expiresAt) return null;
    return Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
  };

  /* ---------- Estados de carga / error ---------- */
  if (loading) {
    return (
      <div
        className="app-container bg-base d-flex justify-content-center align-items-center"
        style={{ minHeight: '100vh' }}
      >
        <div
          className="spinner-border"
          role="status"
          style={{ color: 'var(--primary)', width: '36px', height: '36px' }}
        >
          <span className="visually-hidden">Cargando anuncio…</span>
        </div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="app-container bg-base" style={{ minHeight: '100vh' }}>
        <Navbar />
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: 'var(--spacing-md)' }}>
          <EmptyState
            variant="error"
            icon={FiAlertTriangle}
            title="Anuncio no encontrado"
            subtitle={error || 'Es posible que el anuncio haya vencido o sido retirado por su autor.'}
            actionLabel="Volver al Mural"
            onAction={() => navigate('/')}
          />
        </div>
      </div>
    );
  }

  const {
    image_url: imageUrl,
    title,
    project_name: projectName,
    project_id: projectId,
    project_logo_url: projectLogoUrl,
    description,
    category,
    instagram_handle: instagramHandle,
    classroom_location: classroomLocation,
    wa_link: waLink,
    has_whatsapp: hasWhatsapp,
    has_instagram: hasInstagram,
    likes_count: likesCount = 0,
    avg_rating: avgRating,
    average_rating: legacyAverageRating,
    expires_at: expiresAt,
  } = announcement;

  const averageRating = Number(avgRating ?? legacyAverageRating ?? 0);

  const cleanInstagram = instagramHandle ? String(instagramHandle).replace(/^@/, '') : null;
  const showWhatsappBtn = isAuthenticated ? Boolean(waLink) : Boolean(hasWhatsapp);
  const showInstagramBtn = isAuthenticated ? Boolean(cleanInstagram) : Boolean(hasInstagram);
  const hasAnyContact = showWhatsappBtn
    || showInstagramBtn
    || (isAuthenticated && Boolean(classroomLocation));
  const redirectToLogin = () => {
    navigate('/login', { state: { from: { pathname: `/announcement/${id}` } } });
  };
  const daysLeft = getDaysLeft(expiresAt);
  const expiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;
  const canReport = isAuthenticated && user?.role !== 'visitor_registered';

  /* ---------- Bloque: proyecto (chip) ---------- */
  const projectAvatar = projectLogoUrl ? (
    <img
      src={projectLogoUrl}
      alt=""
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '1px solid var(--border)',
        flexShrink: 0,
      }}
    />
  ) : (
    <span
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        flexShrink: 0,
      }}
    >
      <FiFolder size={16} style={{ color: 'var(--primary)' }} aria-hidden="true" />
    </span>
  );

  const projectChipStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 14px 6px 6px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    textDecoration: 'none',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontWeight: 600,
    maxWidth: '100%',
  };

  const projectChip = projectId ? (
    <Link to={`/proyecto/${projectId}`} style={projectChipStyle} aria-label={`Ver proyecto ${projectName}`}>
      {projectAvatar}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {projectName}
      </span>
      <FiChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} aria-hidden="true" />
    </Link>
  ) : (
    <div style={projectChipStyle}>
      {projectAvatar}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {projectName}
      </span>
    </div>
  );

  /* ---------- Bloque: contacto ---------- */
  let contactContent;
  if (hasAnyContact) {
    contactContent = (
      <section style={cardStyle} aria-labelledby="contact-title">
        <h2 id="contact-title" style={sectionLabelStyle}>
          Contactar
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* WhatsApp: acción principal */}
          {showWhatsappBtn && (isAuthenticated ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta"
              style={{
                ...actionBase,
                backgroundColor: '#25D366',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
              }}
            >
              <FiMessageCircle size={18} aria-hidden="true" /> Contactar por WhatsApp
            </a>
          ) : (
            <button
              type="button"
              onClick={redirectToLogin}
              className="btn-cta"
              style={{
                ...actionBase,
                backgroundColor: '#25D366',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
              }}
            >
              <FiMessageCircle size={18} aria-hidden="true" /> Contactar por WhatsApp
            </button>
          ))}

          {/* Instagram */}
          {showInstagramBtn && (isAuthenticated ? (
            <a
              href={`https://instagram.com/${cleanInstagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta btn-cta-outline"
              style={{ ...actionBase, fontWeight: 600 }}
            >
              <FiInstagram size={18} aria-hidden="true" /> @{cleanInstagram}
            </a>
          ) : (
            <button
              type="button"
              onClick={redirectToLogin}
              className="btn-cta btn-cta-outline"
              style={{ ...actionBase, fontWeight: 600 }}
            >
              <FiInstagram size={18} aria-hidden="true" /> Contactar por Instagram
            </button>
          ))}

          {/* Ubicación */}
          {isAuthenticated && classroomLocation && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <FiMapPin size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} aria-hidden="true" />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-muted)',
                    fontWeight: 700,
                  }}
                >
                  Dónde encontrarlo
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    wordBreak: 'break-word',
                  }}
                >
                  {classroomLocation}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  } else {
    contactContent = (
      <section style={{ ...cardStyle, textAlign: 'center' }}>
        <FiUser size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} aria-hidden="true" />
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
          El emprendedor aún no ha configurado medios de contacto públicos.
        </p>
      </section>
    );
  }

  return (
    <div
      className="app-container bg-base"
      style={{
        minHeight: '100vh',
        paddingBottom: 'calc(var(--spacing-3xl) + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <Navbar />

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }}>
        {/* 1. Imagen principal con botón de regreso y categoría superpuestos */}
        <div
          style={{
            width: '100%',
            aspectRatio: '16/9',
            backgroundColor: 'var(--bg-card)',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '20px',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          }}
        >
          {imageUrl && !imgFailed ? (
            <img
              src={imageUrl}
              alt={title}
              onError={() => setImgFailed(true)}
              loading="eager"
              decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: 'var(--text-secondary)',
              }}
            >
              <FiImage size={36} aria-hidden="true" />
              <span style={{ fontSize: '13px' }}>Sin imagen disponible</span>
            </div>
          )}

          {/* Botón volver flotante */}
          <Link
            to="/"
            aria-label="Volver al Mural"
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              color: '#FFFFFF',
              textDecoration: 'none',
            }}
          >
            <FiArrowLeft size={20} aria-hidden="true" />
          </Link>

          {/* Categoría superpuesta */}
          <div style={{ position: 'absolute', left: '12px', bottom: '12px' }}>
            <CategoryBadge category={category} />
          </div>
        </div>

        {/* 2. Encabezado: título, resumen de popularidad y proyecto */}
        <header style={{ marginBottom: '20px' }}>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: '0 0 10px 0',
              lineHeight: 1.25,
              wordBreak: 'break-word',
            }}
          >
            {title}
          </h1>

          <div
            className="d-flex align-items-center gap-3 flex-wrap"
            style={{ marginBottom: '14px', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}
          >
            <span className="d-inline-flex align-items-center gap-1">
              <FiStar style={{ color: 'var(--accent)' }} aria-hidden="true" />
              {averageRating > 0 ? averageRating.toFixed(1) : 'Sin calificaciones'}
            </span>
            <span className="d-inline-flex align-items-center gap-1">
              <FiHeart style={{ color: 'var(--primary)' }} aria-hidden="true" />
              {likesCount} {Number(likesCount) === 1 ? 'me gusta' : 'me gusta'}
            </span>
          </div>

          {projectChip}
        </header>

        {/* 3. Descripción */}
        <section style={cardStyle} aria-labelledby="desc-title">
          <h2 id="desc-title" style={sectionLabelStyle}>
            Acerca de este anuncio
          </h2>
          <p
            style={{
              color: 'var(--text-primary)',
              fontSize: '15px',
              lineHeight: 1.65,
              margin: 0,
              whiteSpace: 'pre-line',
              wordBreak: 'break-word',
            }}
          >
            {description || 'Sin descripción disponible.'}
          </p>
        </section>

        {/* 4. Contacto (acción principal) */}
        {contactContent}

        {/* 5. Tu opinión (si no está autenticado, redirige a login al interactuar) */}
        <section style={cardStyle} aria-labelledby="opinion-title">
          <h2 id="opinion-title" style={sectionLabelStyle}>
            Tu opinión
          </h2>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <StarRating value={userRating} onChange={handleRating} size={24} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {userRating > 0 ? 'Toca de nuevo tu calificación para quitarla' : 'Toca una estrella para calificar'}
              </span>
            </div>
            <LikeButton liked={userLiked} count={likesCount} onClick={handleLike} />
          </div>
        </section>

        {/* 6. Reportar (acción secundaria, discreta) */}
        {canReport && (
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <button
              type="button"
              onClick={() => setReportModalOpen(true)}
              disabled={userReported}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '13px',
                cursor: userReported ? 'default' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                minHeight: '44px',
                padding: '0 12px',
                opacity: userReported ? 0.7 : 1,
              }}
            >
              <FiFlag size={14} aria-hidden="true" />
              <span>{userReported ? 'Reporte enviado' : 'Reportar anuncio'}</span>
            </button>
          </div>
        )}

        {/* 7. Vigencia (siempre al final) */}
        {expiresAt && (
          <div
            className="d-flex align-items-center justify-content-center gap-2 flex-wrap"
            style={{
              fontSize: '13px',
              color: expiringSoon ? 'var(--warning)' : 'var(--text-secondary)',
              paddingTop: '16px',
              marginTop: '8px',
              borderTop: '1px solid var(--border)',
            }}
          >
            <FiCalendar size={16} aria-hidden="true" />
            <span>Vigente hasta el {formatDate(expiresAt)}</span>
            {expiringSoon && (
              <span className="badge bg-warning text-dark" style={{ fontSize: '11px', fontWeight: 700 }}>
                {daysLeft === 1 ? 'Vence mañana' : `Vence en ${daysLeft} días`}
              </span>
            )}
          </div>
        )}
      </main>

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
