import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import ChipNav from '../components/ChipNav';
import AnnouncementCard from '../components/AnnouncementCard';

export default function AdminPanel() {
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState('moderation');
  const [moderationQueue, setModerationQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [claimTickets, setClaimTickets] = useState([]);

  const loadModerationQueue = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getModerationQueue();
      setModerationQueue(response.data.queue || []);
    } catch (error) {
      console.error('Error loading moderation queue:', error);
      showToast('Error al cargar la cola de moderación', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadClaimTickets = useCallback(async () => {
    try {
      const response = await api.getClaimTickets();
      setClaimTickets(response.data.tickets || []);
    } catch (error) {
      console.error('Error loading claim tickets:', error);
    }
  }, []);

  useEffect(() => {
    loadModerationQueue();
    loadClaimTickets();
  }, [loadModerationQueue, loadClaimTickets]);

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

  const handleResolveClaim = async (ticketId) => {
    try {
      await api.resolveClaimTicket(ticketId);
      showToast('Ticket resuelto', 'success');
      loadClaimTickets();
    } catch (error) {
      showToast('Error al resolver ticket', 'error');
    }
  };

  // Ordenar: urgentes primero
  const sortedQueue = [...moderationQueue].sort((a, b) => {
    if (a.urgency_alert_at && !b.urgency_alert_at) return -1;
    if (!a.urgency_alert_at && b.urgency_alert_at) return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <div className="admin-panel" style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh' }}>
      <Navbar />

      <div className="container-fluid py-4">
        <div className="row">
          {/* Tabs */}
          <div className="col-12 mb-4">
            <ChipNav
              options={[
                { label: 'Moderación', value: 'moderation' },
                { label: 'Reclamos de Matrícula', value: 'claims' },
              ]}
              activeValue={activeTab}
              onChange={setActiveTab}
            />
          </div>

          {/* Contenido */}
          <div className="col-12">
            {/* Moderación */}
            {activeTab === 'moderation' && (
              <div>
                <h4 className="mb-4" style={{ color: 'var(--text-primary)' }}>Cola de Moderación</h4>

                {loading && (
                  <div className="text-center py-5">
                    <div className="spinner-border" role="status" style={{ color: 'var(--primary)' }} />
                  </div>
                )}
                {!loading && sortedQueue.length === 0 && (
                  <div className="text-center py-5">
                    <p style={{ color: 'var(--text-secondary)' }}>No hay anuncios pendientes de revisión</p>
                  </div>
                )}
                {!loading && sortedQueue.length > 0 && (
                  <div className="row">
                    {sortedQueue.map((announcement) => (
                      <div key={announcement.id} className="col-12 col-md-6 col-lg-4 mb-4">
                        <div
                          className="card card-mml h-100"
                          style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: announcement.urgency_alert_at
                              ? '2px solid var(--warning)'
                              : '1px solid var(--border)',
                            borderRadius: 'var(--radius-lg)',
                            overflow: 'hidden',
                          }}
                        >
                          <div className="card-body">
                            {/* Announcement Card Content */}
                            <AnnouncementCard
                              announcement={announcement}
                              showStatus
                            />

                            {/* Custom Actions for Admin */}
                            <div className="mt-3 d-flex gap-2">
                              {announcement.status === 'pending_review' && (
                              <>
                                <button
                                  type="button"
                                  className="btn-cta"
                                  onClick={() => handleApprove(announcement.id)}
                                  style={{
                                    backgroundColor: 'var(--status-active)',
                                    color: 'var(--text-primary)',
                                    border: 'none',
                                    fontSize: '12px',
                                    padding: '4px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Aprobar
                                </button>
                                <button
                                  type="button"
                                  className="btn-cta-outline"
                                  onClick={() => setSelectedAnnouncement({
                                    ...announcement,
                                    showReject: true,
                                  })}
                                  style={{
                                    backgroundColor: 'transparent',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-secondary)',
                                    fontSize: '12px',
                                    padding: '4px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Rechazar
                                </button>
                              </>
                              )}
                              {announcement.status === 'shadowban' && (
                              <button
                                type="button"
                                className="btn-cta"
                                onClick={() => handleApprove(announcement.id)}
                                style={{
                                  backgroundColor: 'var(--status-pending)',
                                  color: 'var(--text-primary)',
                                  border: 'none',
                                  fontSize: '12px',
                                  padding: '4px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  cursor: 'pointer',
                                }}
                              >
                                Restaurar
                              </button>
                              )}
                            </div>

                            {/* Comparison Action */}
                            {announcement.hash_match && (
                            <div className="mt-2">
                              <button
                                type="button"
                                className="btn-cta-outline"
                                onClick={() => setSelectedAnnouncement(announcement)}
                                style={{
                                  width: '100%',
                                  backgroundColor: 'transparent',
                                  border: '1px solid var(--border)',
                                  color: 'var(--text-secondary)',
                                  fontSize: '12px',
                                  padding: '4px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  cursor: 'pointer',
                                }}
                              >
                                Ver comparación de imagen
                              </button>
                            </div>
                            )}

                            {/* Rejection Form */}
                            {selectedAnnouncement?.id === announcement.id
                              && selectedAnnouncement.showReject && (
                              <div className="mt-3">
                                <textarea
                                  className="form-control mb-2"
                                  placeholder="Motivo del rechazo"
                                  value={rejectReason}
                                  onChange={(e) => setRejectReason(e.target.value)}
                                  rows={2}
                                  style={{
                                    backgroundColor: 'var(--bg-elevated)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-primary)',
                                  }}
                                />
                                <div className="d-flex gap-2">
                                  <button
                                    type="button"
                                    className="btn-cta"
                                    onClick={() => handleReject(announcement.id)}
                                    style={{
                                      backgroundColor: 'var(--status-rejected)',
                                      color: 'var(--text-primary)',
                                      border: 'none',
                                      fontSize: '12px',
                                      padding: '4px 8px',
                                      borderRadius: 'var(--radius-sm)',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Confirmar Rechazo
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-cta-outline"
                                    onClick={() => {
                                      setSelectedAnnouncement(null);
                                      setRejectReason('');
                                    }}
                                    style={{
                                      backgroundColor: 'transparent',
                                      border: '1px solid var(--border)',
                                      color: 'var(--text-secondary)',
                                      fontSize: '12px',
                                      padding: '4px 8px',
                                      borderRadius: 'var(--radius-sm)',
                                      cursor: 'pointer',
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
                  <p style={{ color: 'var(--text-secondary)' }}>No hay tickets de reclamo</p>
                ) : (
                  <div className="row">
                    {claimTickets.map((ticket) => (
                      <div key={ticket.id} className="col-12 mb-3">
                        <div
                          className="card card-mml"
                          style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--spacing-sm)',
                          }}
                        >
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1" style={{ color: 'var(--text-primary)' }}>
                                  Matrícula: {ticket.matricula}
                                </h6>
                                <p className="mb-1" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                  WhatsApp del reclamante: {ticket.whatsapp_number}
                                </p>
                                <small style={{ color: 'var(--text-muted)' }}>
                                  {new Date(ticket.created_at).toLocaleString('es-MX')}
                                </small>
                              </div>
                              <div>
                                <StatusBadge status={ticket.status} />
                                {ticket.status === 'pending' && (
                                <button
                                  type="button"
                                  className="btn-cta"
                                  onClick={() => handleResolveClaim(ticket.id)}
                                  style={{
                                    backgroundColor: 'var(--primary)',
                                    color: 'var(--text-primary)',
                                    border: 'none',
                                    padding: '4px 12px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    marginTop: '8px',
                                  }}
                                >
                                  Resolver
                                </button>
                                )}
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
          </div>
        </div>
      </div>
    </div>
  );
}
