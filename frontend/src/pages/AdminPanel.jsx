import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import StatusBadge from '../components/StatusBadge';

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('moderation');
  const [moderationQueue, setModerationQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [claimTickets, setClaimTickets] = useState([]);

  useEffect(() => {
    loadModerationQueue();
    loadClaimTickets();
  }, []);

  const loadModerationQueue = async () => {
    try {
      setLoading(true);
      const response = await api.getModerationQueue();
      setModerationQueue(response.data.announcements || []);
    } catch (error) {
      console.error('Error loading moderation queue:', error);
      showToast('Error al cargar la cola de moderación', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadClaimTickets = async () => {
    try {
      const response = await api.getClaimTickets();
      setClaimTickets(response.data.tickets || []);
    } catch (error) {
      console.error('Error loading claim tickets:', error);
    }
  };

  const handleApprove = async (announcementId) => {
    try {
      await api.approveAnnouncement(announcementId);
      showToast('Anuncio aprobado', 'success');
      loadModerationQueue();
    } catch (error) {
      showToast('Error al aprobar', 'error');
    }
  };

  const handleReject = async (announcementId) => {
    if (!rejectReason.trim()) {
      showToast('Ingresa un motivo de rechazo', 'warning');
      return;
    }
    
    try {
      await api.rejectAnnouncement(announcementId, rejectReason);
      showToast('Anuncio rechazado', 'success');
      setSelectedAnnouncement(null);
      setRejectReason('');
      loadModerationQueue();
    } catch (error) {
      showToast('Error al rechazar', 'error');
    }
  };

  const handleSuspendUser = async (userId) => {
    if (!confirm('¿Estás seguro de suspender a este usuario?')) return;
    
    try {
      await api.suspendUser(userId);
      showToast('Usuario suspendido', 'success');
    } catch (error) {
      showToast('Error al suspender usuario', 'error');
    }
  };

  const handleResolveClaim = async (ticketId) => {
    try {
      await api.resolveClaimTicket(ticketId);
      showToast('Ticket resuelto', 'success');
      loadClaimTickets();
    } catch (error) {
      showToast('Error al resolver ticket', 'error');
    }
  };

  const handleGenerateQR = async () => {
    try {
      const response = await api.getQRCode();
      // El backend devuelve la imagen como base64
      setQrCode(response.data.qr);
    } catch (error) {
      showToast('Error al generar QR', 'error');
    }
  };

  const handleLogout = async () => {
    await api.logout();
    navigate('/');
  };

  // Ordenar: urgentes primero
  const sortedQueue = [...moderationQueue].sort((a, b) => {
    if (a.urgency_alert_at && !b.urgency_alert_at) return -1;
    if (!a.urgency_alert_at && b.urgency_alert_at) return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <div className="admin-panel">
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
            Mural Maz Lince - Admin
          </Link>
          
          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="btn btn-link text-light" style={{ textDecoration: 'none' }}>
              Ver Feed
            </Link>
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
          {/* Tabs */}
          <div className="col-12 mb-4">
            <ul className="nav nav-pills">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'moderation' ? 'active' : ''}`}
                  onClick={() => setActiveTab('moderation')}
                  style={{
                    backgroundColor: activeTab === 'moderation' ? 'var(--primary)' : 'transparent',
                    color: 'var(--text-primary)',
                  }}
                >
                  Moderación 
                  {moderationQueue.filter(a => a.urgency_alert_at).length > 0 && (
                    <span className="badge bg-danger ms-2">
                      {moderationQueue.filter(a => a.urgency_alert_at).length}
                    </span>
                  )}
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'claims' ? 'active' : ''}`}
                  onClick={() => setActiveTab('claims')}
                  style={{
                    backgroundColor: activeTab === 'claims' ? 'var(--primary)' : 'transparent',
                    color: 'var(--text-primary)',
                  }}
                >
                  Reclamos de Matrícula
                  {claimTickets.filter(t => t.status === 'pending').length > 0 && (
                    <span className="badge bg-warning ms-2">
                      {claimTickets.filter(t => t.status === 'pending').length}
                    </span>
                  )}
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'qr' ? 'active' : ''}`}
                  onClick={() => setActiveTab('qr')}
                  style={{
                    backgroundColor: activeTab === 'qr' ? 'var(--primary)' : 'transparent',
                    color: 'var(--text-primary)',
                  }}
                >
                  Generar QR
                </button>
              </li>
            </ul>
          </div>

          {/* Contenido */}
          <div className="col-12">
            {/* Moderación */}
            {activeTab === 'moderation' && (
              <div>
                <h4 className="mb-4" style={{ color: 'var(--text-primary)' }}>Cola de Moderación</h4>
                
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" />
                  </div>
                ) : sortedQueue.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">No hay anuncios pendientes de revisión</p>
                  </div>
                ) : (
                  <div className="row">
                    {sortedQueue.map(announcement => (
                      <div key={announcement.id} className="col-12 col-md-6 col-lg-4 mb-4">
                        <div 
                          className={`card h-100 ${announcement.urgency_alert_at ? 'border-warning' : ''}`}
                          style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: announcement.urgency_alert_at 
                              ? '2px solid var(--warning)' 
                              : '1px solid var(--bg-elevated)',
                            borderRadius: 'var(--border-radius-lg)',
                          }}
                        >
                          <div className="card-body">
                            {/* Urgency alert */}
                            {announcement.urgency_alert_at && (
                              <div 
                                className="alert alert-warning py-2 px-3 mb-3"
                                style={{ 
                                  fontSize: '0.85rem',
                                  backgroundColor: 'rgba(255, 152, 0, 0.15)',
                                  border: '1px solid var(--warning)',
                                }}
                              >
                                ⚠️ ALTA PRIORIDAD - {announcement.reports_count} reportes
                              </div>
                            )}
                            
                            {/* Imagen */}
                            {announcement.image_url && (
                              <img 
                                src={announcement.image_url} 
                                alt={announcement.title}
                                className="img-fluid mb-3"
                                style={{ 
                                  borderRadius: 'var(--border-radius-md)',
                                  maxHeight: '150px',
                                  objectFit: 'cover',
                                  width: '100%',
                                }}
                              />
                            )}
                            
                            {/* Info */}
                            <h5 className="mb-2" style={{ color: 'var(--text-primary)' }}>
                              {announcement.title}
                            </h5>
                            
                            <p className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                              Por: {announcement.display_name}
                            </p>
                            
                            <p className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                              Categoría: {announcement.category}
                            </p>
                            
                            <StatusBadge status={announcement.status} />
                            
                            {/* Motivo */}
                            {announcement.moderation_reason && (
                              <div className="mt-3 p-2" style={{ 
                                backgroundColor: 'var(--bg-elevated)', 
                                borderRadius: 'var(--border-radius-sm)',
                                fontSize: '0.85rem',
                              }}>
                                <strong>Motivo:</strong> {announcement.moderation_reason}
                              </div>
                            )}
                            
                            {/* Hash match */}
                            {announcement.hash_match && (
                              <div className="mt-3">
                                <button
                                  className="btn btn-sm btn-outline-info"
                                  onClick={() => setSelectedAnnouncement(announcement)}
                                >
                                  Ver comparación de imagen
                                </button>
                              </div>
                            )}
                            
                            {/* Acciones */}
                            <div className="mt-3 d-flex gap-2">
                              {announcement.status === 'pending_review' && (
                                <>
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => handleApprove(announcement.id)}
                                  >
                                    Aprobar
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => setSelectedAnnouncement({ ...announcement, showReject: true })}
                                  >
                                    Rechazar
                                  </button>
                                </>
                              )}
                              {announcement.status === 'shadowban' && (
                                <button
                                  className="btn btn-sm btn-warning"
                                  onClick={() => handleApprove(announcement.id)}
                                >
                                  Restaurar
                                </button>
                              )}
                            </div>
                            
                            {/* Formulario de rechazo */}
                            {selectedAnnouncement?.id === announcement.id && selectedAnnouncement.showReject && (
                              <div className="mt-3">
                                <textarea
                                  className="form-control mb-2"
                                  placeholder="Motivo del rechazo"
                                  value={rejectReason}
                                  onChange={(e) => setRejectReason(e.target.value)}
                                  rows={2}
                                  style={{
                                    backgroundColor: 'var(--bg-elevated)',
                                    border: '1px solid var(--bg-hover)',
                                    color: 'var(--text-primary)',
                                  }}
                                />
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleReject(announcement.id)}
                                  >
                                    Confirmar Rechazo
                                  </button>
                                  <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => {
                                      setSelectedAnnouncement(null);
                                      setRejectReason('');
                                    }}
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reclamos de matrícula */}
            {activeTab === 'claims' && (
              <div>
                <h4 className="mb-4" style={{ color: 'var(--text-primary)' }}>Reclamos de Matrícula</h4>
                
                {claimTickets.length === 0 ? (
                  <p className="text-muted">No hay tickets de reclamo</p>
                ) : (
                  <div className="list-group">
                    {claimTickets.map(ticket => (
                      <div
                        key={ticket.id}
                        className="list-group-item"
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--bg-elevated)',
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1" style={{ color: 'var(--text-primary)' }}>
                              Matrícula: {ticket.matricula}
                            </h6>
                            <p className="mb-1 text-muted" style={{ fontSize: '0.9rem' }}>
                              WhatsApp del reclamante: {ticket.whatsapp_number}
                            </p>
                            <small className="text-muted">
                              {new Date(ticket.created_at).toLocaleString('es-MX')}
                            </small>
                          </div>
                          <div>
                            <StatusBadge status={ticket.status} />
                            {ticket.status === 'pending' && (
                              <button
                                className="btn btn-sm btn-primary mt-2"
                                onClick={() => handleResolveClaim(ticket.id)}
                                style={{ backgroundColor: 'var(--primary)' }}
                              >
                                Resolver
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Generador QR */}
            {activeTab === 'qr' && (
              <div>
                <h4 className="mb-4" style={{ color: 'var(--text-primary)' }}>Generador de Código QR</h4>
                
                <div 
                  className="card"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--bg-elevated)',
                    borderRadius: 'var(--border-radius-lg)',
                    maxWidth: '500px',
                  }}
                >
                  <div className="card-body text-center">
                    {!qrCode ? (
                      <>
                        <p className="text-muted mb-4">
                          Genera un código QR para colocar en los tableros físicos
                        </p>
                        <button
                          className="btn btn-primary"
                          onClick={handleGenerateQR}
                          style={{ backgroundColor: 'var(--primary)' }}
                        >
                          Generar QR
                        </button>
                      </>
                    ) : (
                      <>
                        <img 
                          src={qrCode} 
                          alt="Código QR"
                          className="img-fluid mb-4"
                          style={{ maxWidth: '300px' }}
                        />
                        <div>
                          <a
                            href={qrCode}
                            download="mural-maz-lince-qr.png"
                            className="btn btn-primary"
                            style={{ backgroundColor: 'var(--primary)' }}
                          >
                            Descargar PNG
                          </a>
                          <button
                            className="btn btn-secondary ms-2"
                            onClick={() => setQrCode(null)}
                          >
                            Generar nuevo
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}