import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * ConfirmModal — Diálogo de confirmación accesible y responsivo.
 *
 * Mejoras aplicadas:
 * 1. Semántica accesible con role="alertdialog" para acciones críticas.
 * 2. Soporte para variantes de intención (danger, primary, warning)
 *    en lugar de botón rojo hardcodeado.
 * 3. Trampa de foco accesible y cierre con tecla Escape.
 * 4. Bloqueo de scroll y restauración automática de foco.
 * 5. Eliminación de defaultProps obsoletos.
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  busy = false,
  busyLabel = null,
}) {
  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const handlersRef = useRef({ onClose, onConfirm, busy });

  handlersRef.current = { onClose, onConfirm, busy };

  useEffect(() => {
    if (!isOpen) return undefined;

    previouslyFocusedRef.current = document.activeElement;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const dialog = dialogRef.current;
    if (dialog) dialog.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (!handlersRef.current.busy) {
          handlersRef.current.onClose();
        }
        return;
      }

      if (event.key !== 'Tab') return;

      const focusables = dialog
        ? Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
          (el) => el.offsetParent !== null,
        )
        : [];

      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const inCycle = active !== dialog && dialog.contains(active);

      if (event.shiftKey) {
        if (active === first || !inCycle) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !inCycle) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      const target = previouslyFocusedRef.current;
      if (target && typeof target.focus === 'function') {
        target.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--primary)',
          borderColor: 'var(--primary)',
          color: '#FFFFFF',
        };
      case 'warning':
        return {
          backgroundColor: 'var(--warning)',
          borderColor: 'var(--warning)',
          color: '#FFFFFF',
        };
      case 'danger':
      default:
        return {
          backgroundColor: 'var(--status-rejected)',
          borderColor: 'var(--status-rejected)',
          color: '#FFFFFF',
        };
    }
  };

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-heading"
        aria-describedby="confirm-modal-desc"
        aria-busy={busy}
        tabIndex={-1}
        className="modal-sheet"
        style={{
          width: '100%',
          maxWidth: '460px',
        }}
      >
        <h2 id="confirm-modal-heading" className="modal-header-title">
          {title}
        </h2>
        <div id="confirm-modal-desc" className="modal-body-text">
          {message}
        </div>

        <div className="modal-actions-grid">
          <button
            type="button"
            className="btn-cta btn-cta-outline"
            disabled={busy}
            onClick={() => handlersRef.current.onClose()}
            style={{
              minHeight: '44px',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
            }}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className="btn-cta btn-cta-primary"
            disabled={busy}
            onClick={() => handlersRef.current.onConfirm()}
            style={{
              minHeight: '44px',
              padding: '0 20px',
              ...getVariantStyles(),
            }}
          >
            {busy && (
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              />
            )}
            <span>{busy ? (busyLabel || confirmLabel) : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.node.isRequired,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  variant: PropTypes.oneOf(['danger', 'primary', 'warning']),
  busy: PropTypes.bool,
  busyLabel: PropTypes.string,
};
