import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiUser,
  FiInstagram,
  FiMessageCircle,
  FiMapPin,
  FiFolder,
} from 'react-icons/fi';
import api from '../services/api';
import Navbar from '../components/Navbar';
import CategoryBadge from '../components/CategoryBadge';
import AnnouncementCard from '../components/AnnouncementCard';
import EmptyState from '../components/EmptyState';

export default function EntrepreneurDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isProjectView = location.pathname.startsWith('/proyecto');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  const [entrepreneur, setEntrepreneur] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    async function fetchData() {
      try {
        if (isProjectView) {
          const res = await api.getPublicProject(id);
          if (isMounted) {
            setProject(res.data.project);
            setEntrepreneur(res.data.entrepreneur);
            setAnnouncements(res.data.announcements || []);
          }
        } else {
          const res = await api.getProfile(id);
          if (isMounted) {
            setEntrepreneur(res.data.entrepreneur);
            setProjectsList(res.data.projects || []);
            setAnnouncements(res.data.announcements || []);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'No se pudo cargar la información');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [id, isProjectView]);

  return (
    <div className="app-container bg-base">
      <Navbar />

      <main style={{ maxWidth: '960px', margin: '0 auto', width: '100%', padding: '24px 16px' }}>
        {/* Botón Volver */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-cta btn-cta-outline btn-cta-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '20px',
            cursor: 'pointer',
          }}
        >
          <FiArrowLeft size={16} /> Volver
        </button>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid var(--border)',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
          </div>
        )}

        {error && !loading && (
          <div
            role="alert"
            style={{
              padding: '20px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--status-rejected)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--status-rejected)',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontWeight: 600 }}>{error}</p>
          </div>
        )}

        {!loading && !error && entrepreneur && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Tarjeta de Perfil del Emprendedor */}
            <section
              aria-label="Perfil del emprendedor"
              className="card-mml"
              style={{
                padding: '28px 24px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '16px',
                }}
              >
                {/* Foto de perfil circular */}
                <div
                  style={{
                    width: '110px',
                    height: '110px',
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
                  {entrepreneur.profile_photo_url ? (
                    <img
                      src={entrepreneur.profile_photo_url}
                      alt={entrepreneur.display_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <FiUser size={46} style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>

                <div>
                  <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                    {entrepreneur.display_name}
                  </h1>
                  {entrepreneur.bio_short && (
                    <p
                      style={{
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                        margin: '0 auto',
                        maxWidth: '560px',
                        lineHeight: 1.5,
                      }}
                    >
                      {entrepreneur.bio_short}
                    </p>
                  )}
                </div>

                {/* Acciones de Contacto */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    marginTop: '8px',
                  }}
                >
                  {/* WhatsApp */}
                  {entrepreneur.wa_link && (
                    <a
                      href={entrepreneur.wa_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-cta btn-cta-primary btn-cta-sm"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        textDecoration: 'none',
                        minHeight: '40px',
                        padding: '0 16px',
                      }}
                    >
                      <FiMessageCircle size={16} /> Contactar por WhatsApp
                    </a>
                  )}

                  {/* Instagram */}
                  {entrepreneur.instagram_handle && (
                    <a
                      href={`https://instagram.com/${entrepreneur.instagram_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-cta btn-cta-outline btn-cta-sm"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        textDecoration: 'none',
                        minHeight: '40px',
                        padding: '0 16px',
                      }}
                    >
                      <FiInstagram size={16} /> @{entrepreneur.instagram_handle}
                    </a>
                  )}

                  {/* Salón de clases / Campus */}
                  {entrepreneur.classroom_location && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-secondary)',
                        fontSize: '13px',
                      }}
                    >
                      <FiMapPin size={15} style={{ color: 'var(--primary)' }} />
                      <span>{entrepreneur.classroom_location}</span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Si es vista de un proyecto específico: Datos del Proyecto */}
            {isProjectView && project && (
              <section
                aria-label="Detalles del proyecto"
                className="card-mml"
                style={{
                  padding: '24px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '2px solid var(--primary)',
                      backgroundColor: 'var(--bg-base)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {project.logo_url ? (
                      <img
                        src={project.logo_url}
                        alt={project.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <FiFolder size={24} style={{ color: 'var(--primary)' }} />
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {project.name}
                      </h2>
                      {project.category_name && (
                        <CategoryBadge category={project.category_name} clickable={false} />
                      )}
                    </div>
                  </div>
                </div>

                {project.description && (
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '12px 0 0 0' }}>
                    {project.description}
                  </p>
                )}
              </section>
            )}

            {/* Si es vista de perfil del emprendedor y tiene múltiples proyectos */}
            {!isProjectView && projectsList.length > 0 && (
              <section aria-label="Proyectos del emprendedor">
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
                  Proyectos ({projectsList.length})
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                  {projectsList.map((p) => (
                    <Link
                      key={p.id}
                      to={`/proyecto/${p.id}`}
                      style={{
                        textDecoration: 'none',
                        padding: '16px',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        transition: 'border-color var(--transition-fast)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {p.logo_url ? (
                            <img
                              src={p.logo_url}
                              alt={p.name}
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '1px solid var(--border)',
                              }}
                            />
                          ) : (
                            <FiFolder style={{ fontSize: '16px', color: 'var(--primary)' }} />
                          )}
                          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {p.name}
                          </span>
                        </div>
                        {p.category_name && (
                          <CategoryBadge category={p.category_name} clickable={false} />
                        )}
                      </div>
                      {p.description && (
                        <p
                          style={{
                            fontSize: '13px',
                            color: 'var(--text-muted)',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {p.description}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Anuncios Activos */}
            <section aria-label="Anuncios activos">
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Anuncios Publicados ({announcements.length})
              </h2>

              {announcements.length === 0 ? (
                <EmptyState
                  title="Sin anuncios publicados"
                  message="Este emprendedor no tiene anuncios activos en este momento."
                />
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {announcements.map((ann) => (
                    <AnnouncementCard
                      key={ann.id}
                      announcement={ann}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
