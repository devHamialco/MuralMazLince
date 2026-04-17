import { useState } from 'react';
import PropTypes from 'prop-types';
import { FaFlag } from 'react-icons/fa';

const REPORT_REASONS = [
  { value: 'offensive', label: 'Contenido ofensivo o inapropiado' },
  { value: 'spam', label: 'Spam o contenido duplicado' },
  { value: 'false', label: 'Información falsa o engañosa' },
  { value: 'other', label: 'Otro motivo' },
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

  return (
    <div 
      className="modal fade show" 
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)' }}
      tabIndex={-1}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title d-flex align-items-center gap-2">
              <FaFlag style={{ color: 'var(--warning)' }} />
              Reportar anuncio
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={handleClose}
              aria-label="Cerrar"
            />
          </div>
          
          {alreadyReported ? (
            <div className="modal-body text-center py-4">
              <FaFlag size={48} color="var(--text-muted)" className="mb-3" />
              <p className="text-muted mb-0">
                Ya has reportado este anuncio. El administrador revisará tu reporte.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <p className="text-secondary mb-3">
                  Selecciona el motivo por el que deseas reportar este anuncio:
                </p>
                
                <div className="report-reasons">
                  {REPORT_REASONS.map((r) => (
                    <div 
                      key={r.value} 
                      className="form-check mb-2"
                    >
                      <input
                        type="radio"
                        className="form-check-input"
                        id={`reason-${r.value}`}
                        name="reportReason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={(e) => setReason(e.target.value)}
                      />
                      <label 
                        className="form-check-label" 
                        htmlFor={`reason-${r.value}`}
                        style={{ cursor: 'pointer' }}
                      >
                        {r.label}
                      </label>
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="alert alert-danger mt-3 mb-0" role="alert">
                    {error}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleClose}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-warning"
                  disabled={submitting}
                >
                  {submitting ? 'Enviando...' : 'Reportar'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

ReportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  announcementId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  alreadyReported: PropTypes.bool,
};