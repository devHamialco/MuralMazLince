/* ReportModal - wireframes-spec.md WF-3.3.2 */
/* Referencia: DDC 2.5, wireframes-spec.md */

import { useState } from 'react';
import PropTypes from 'prop-types';
import { FiFlag, FiCheck, FiX } from 'react-icons/fi';

const REPORT_REASONS = [
  { value: 'offensive', label: 'Contenido ofensivo o inapropiado' },
  { value: 'spam', label: 'Spam o contenido duplicado' },
  { value: 'false', label: 'Información falsa o engañosa' },
  { value: 'other', label: 'Otro' },
];

export default function ReportModal({ isOpen, onClose, onSubmit, announcementId, alreadyReported = false }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason) {
      setError('Por favor selecciona un motivo');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(announcementId, reason);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al enviar el reporte');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setError(null);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 'var(--z-modal-backdrop)',
      }}
      onClick={handleOverlayClick}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '16px 16px 0 0',
          padding: 'var(--spacing-lg)',
          width: '375px',
          maxWidth: '100%',
          animation: 'slideUp 200ms ease-out',
        }}
      >
        {/* Handle de arrastre */}
        <div
          style={{
            width: '40px',
            height: '4px',
            backgroundColor: 'var(--border)',
            borderRadius: '2px',
            margin: '0 auto var(--spacing-md)',
          }}
        />

        {/* Título */}
        <div className="d-flex align-items-center gap-2" style={{ marginBottom: 'var(--spacing-sm)' }}>
          <FiFlag size={20} style={{ color: 'var(--text-primary)' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Reportar este anuncio
          </h2>
        </div>

        {/* Nota de confidencialidad */}
        <div
          style={{
            backgroundColor: 'rgba(196,24,74,0.1)',
            borderLeft: '2px solid var(--primary)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            marginBottom: '20px',
          }}
        >
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
            Tu reporte es confidencial. El emprendedor no sabrá que fuiste tú.
          </p>
        </div>

        {alreadyReported ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-lg) 0' }}>
            <FiCheck size={32} style={{ color: 'var(--status-active)', marginBottom: 'var(--spacing-sm)' }} />
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Ya enviaste un reporte para este anuncio.
            </p>
            <button
              onClick={handleClose}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                padding: '8px 24px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                marginTop: 'var(--spacing-md)',
              }}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Lista de motivos */}
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              {REPORT_REASONS.map((r) => (
                <div
                  key={r.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '48px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                  onClick={() => setReason(r.value)}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: `2px solid ${reason === r.value ? 'var(--primary)' : 'var(--border)'}`,
                      marginRight: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {reason === r.value && (
                      <div
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary)',
                        }}
                      />
                    )}
                  </div>
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                    {r.label}
                  </span>
                </div>
              ))}
            </div>

            {error && (
              <p style={{ fontSize: '12px', color: 'var(--status-rejected)', marginBottom: 'var(--spacing-sm)' }}>
                {error}
              </p>
            )}

            {/* Botones */}
            <button
              type="submit"
              disabled={!reason || submitting}
              className="btn-cta btn-cta-primary"
              style={{
                width: '100%',
                height: '52px',
                marginBottom: 'var(--spacing-sm)',
              }}
            >
              {submitting ? 'Enviando...' : 'Confirmar reporte'}
            </button>

            <button
              type="button"
              onClick={handleClose}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                padding: '8px',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              Cancelar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

ReportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  announcementId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  alreadyReported: PropTypes.bool,
};