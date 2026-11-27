import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FiFlag, FiCheck, FiAlertCircle } from 'react-icons/fi';

const REPORT_REASONS = [
  { value: 'offensive', label: 'Contenido ofensivo o inapropiado' },
  { value: 'spam', label: 'Spam o contenido duplicado' },
  { value: 'false', label: 'Información falsa o engañosa' },
  { value: 'other', label: 'Otro motivo' },
];

/**
 * ReportModal — Diálogo accesible de reporte de anuncios.
 *
 * Mejoras aplicadas:
 * 1. Overlay estándar sin botones invisibles en el DOM que rompan el tab order.
 * 2. Accesibilidad completa: Escape listener, focus trap, foco inicial y restauración.
 * 3. Bloqueo de scroll en body mientras está abierto.
 * 4. Diseño bottom sheet responsive con safe-area-inset-bottom.
 * 5. Radiogroup con targets táctiles cómodos (48px) e indicador de foco.
 * 6. Feedback de error accesible con role="alert".
 */
export default function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  announcementId = null,
  alreadyReported = false,
}) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const modalRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  const handleClose = useCallback(() => {
    if (submitting) return;
    setReason('');
    setError(null);
    onClose();
  }, [submitting, onClose]);

  // Guardar y restaurar foco
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement;
      // Enfocar primer radio button o diálogo
      setTimeout(() => {
        const firstRadio = modalRef.current?.querySelector('input[type="radio"]');
        if (firstRadio) {
          firstRadio.focus();
        } else {
          modalRef.current?.focus();
        }
      }, 50);
    } else if (previouslyFocusedRef.current) {
      previouslyFocusedRef.current.focus?.();
    }
  }, [isOpen]);

  // Bloquear scroll de body
  useEffect(() => {
    if (!isOpen) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Escape y Focus Trap
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !submitting) {
        handleClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );

        if (focusable.length === 0) return;
        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, handleClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason) {
      setError('Por favor selecciona un motivo para tu reporte.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(announcementId, reason);
      handleClose();
    } catch (err) {
      setError(err?.message || 'Error al enviar el reporte. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) handleClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        tabIndex={-1}
        className="modal-sheet"
        style={{
          width: '100%',
          maxWidth: '460px',
          maxHeight: '90dvh',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
        }}
      >
        {/* Indicador de arrastre decorativo */}
        <div
          aria-hidden="true"
          style={{
            width: '40px',
            height: '4px',
            backgroundColor: 'var(--border)',
            borderRadius: '2px',
            margin: '0 auto var(--spacing-md)',
          }}
        />

        {/* Encabezado */}
        <div className="d-flex align-items-center gap-2" style={{ marginBottom: 'var(--spacing-sm)' }}>
          <FiFlag size={20} style={{ color: 'var(--primary)' }} aria-hidden="true" />
          <h2
            id="report-modal-title"
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Reportar este anuncio
          </h2>
        </div>

        {/* Nota de confidencialidad */}
        <div
          style={{
            backgroundColor: 'rgba(217, 37, 40, 0.08)',
            borderLeft: '3px solid var(--primary)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            marginBottom: '16px',
          }}
        >
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
            Tu reporte es confidencial. El emprendedor no sabrá quién lo envió.
          </p>
        </div>

        {alreadyReported ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-lg) 0' }}>
            <FiCheck size={36} style={{ color: 'var(--status-active)', marginBottom: 'var(--spacing-sm)' }} />
            <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 600 }}>
              Reporte registrado
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Ya enviaste un reporte para este anuncio. Nuestro equipo lo revisará a la brevedad.
            </p>
            <button
              type="button"
              className="btn-cta btn-cta-outline"
              onClick={handleClose}
              style={{
                width: '100%',
                minHeight: '44px',
                border: '1px solid var(--border)',
              }}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Lista de motivos de reporte con radiogroup accesible */}
            <div
              role="radiogroup"
              aria-label="Motivo del reporte"
              style={{ marginBottom: '16px' }}
            >
              {REPORT_REASONS.map((r) => {
                const isSelected = reason === r.value;
                return (
                  <label
                    key={r.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      minHeight: '48px',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'var(--bg-elevated)' : 'transparent',
                      border: `1px solid ${isSelected ? 'var(--primary)' : 'transparent'}`,
                      borderBottom: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                      cursor: 'pointer',
                      marginBottom: '4px',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      value={r.value}
                      checked={isSelected}
                      onChange={() => {
                        setReason(r.value);
                        setError(null);
                      }}
                      style={{
                        marginRight: '12px',
                        accentColor: 'var(--primary)',
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                      }}
                    />
                    <span
                      style={{
                        fontSize: '14px',
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    >
                      {r.label}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Error accesible */}
            {error && (
              <div
                role="alert"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--status-rejected)',
                  fontSize: '13px',
                  marginBottom: '16px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <FiAlertCircle size={16} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {/* Acciones */}
            <div className="modal-actions-grid" style={{ marginTop: '8px' }}>
              <button
                type="button"
                className="btn-cta btn-cta-outline"
                disabled={submitting}
                onClick={handleClose}
                style={{ minHeight: '48px' }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={!reason || submitting}
                className="btn-cta btn-cta-primary"
                aria-busy={submitting}
                style={{ minHeight: '48px' }}
              >
                {submitting ? 'Enviando reporte…' : 'Confirmar reporte'}
              </button>
            </div>
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
