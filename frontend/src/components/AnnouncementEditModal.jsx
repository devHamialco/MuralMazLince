import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { FiEdit3, FiAlertCircle } from 'react-icons/fi';
import { CATEGORIES } from '../constants/categories';

const TITLE_MAX_LENGTH = 120;
const DESCRIPTION_MAX_LENGTH = 1000;

const toInputDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * AnnouncementEditModal — Modal accesible (Bottom Sheet) para editar anuncios.
 *
 * Mejoras aplicadas:
 * 1. Accesibilidad: cierre con Escape, focus trap, foco inicial en título,
 *    devolución de foco al cerrar y bloqueo de scroll en el body.
 * 2. Bottom sheet real: max-height: 90dvh, overflow-y: auto y acciones sticky.
 * 3. Prevención de cierre accidental: confirmación si el formulario está sucio.
 * 4. Categorías consistentes con <optgroup label="Productos"> y <optgroup label="Servicios">.
 * 5. Manejo y feedback visible de errores si onSave falla o rechaza.
 * 6. Inputs a 16px mínimo para evitar zoom automático en iOS Safari.
 * 7. Validación con trim() para rechazar strings con puros espacios.
 * 8. Botones apilados a ancho completo con acción primaria arriba en móvil.
 */
export default function AnnouncementEditModal({
  isOpen,
  announcement = null,
  onClose,
  onSave,
  busy = false,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [saveError, setSaveError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const modalRef = useRef(null);
  const titleInputRef = useRef(null);
  const triggerElementRef = useRef(null);

  const { today, maxExpiry } = useMemo(() => {
    const dateToday = toInputDate(new Date());
    const maxExpiryDate = new Date();
    maxExpiryDate.setDate(maxExpiryDate.getDate() + 30);
    return { today: dateToday, maxExpiry: toInputDate(maxExpiryDate) };
  }, []);

  // Cargar datos del anuncio
  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title || '');
      setDescription(announcement.description || '');
      setCategory(announcement.custom_category || announcement.category_name || '');
      if (announcement.expires_at) {
        const d = new Date(announcement.expires_at);
        if (!Number.isNaN(d.getTime())) {
          setExpiresAt(toInputDate(d));
        } else {
          setExpiresAt('');
        }
      } else {
        setExpiresAt('');
      }
      setSaveError(null);
      setValidationError(null);
      setShowDiscardConfirm(false);
    }
  }, [announcement]);

  // Verificar si hay cambios no guardados
  const isDirty = useMemo(() => {
    if (!announcement) return false;
    const initialTitle = announcement.title || '';
    const initialDesc = announcement.description || '';
    const initialCat = announcement.custom_category || announcement.category_name || '';
    const initialExp = announcement.expires_at
      ? toInputDate(new Date(announcement.expires_at))
      : '';

    return (
      title.trim() !== initialTitle.trim()
      || description.trim() !== initialDesc.trim()
      || category !== initialCat
      || (expiresAt || '') !== (initialExp || '')
    );
  }, [announcement, title, description, category, expiresAt]);

  const handleClose = useCallback(() => {
    if (busy) return;
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  }, [busy, isDirty, onClose]);

  // Guardar y restaurar foco del elemento desencadenante
  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement;
      // Enfocar primer campo
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    } else if (triggerElementRef.current) {
      triggerElementRef.current.focus?.();
    }
  }, [isOpen]);

  // Bloquear scroll del body mientras el modal esté abierto
  useEffect(() => {
    if (!isOpen) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Cierre con Escape y Focus Trap
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !busy) {
        if (showDiscardConfirm) {
          setShowDiscardConfirm(false);
        } else {
          handleClose();
        }
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
  }, [isOpen, busy, handleClose, showDiscardConfirm]);

  if (!isOpen || !announcement) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);
    setSaveError(null);

    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();

    if (!trimmedTitle) {
      setValidationError('El título del anuncio no puede estar vacío.');
      titleInputRef.current?.focus();
      return;
    }

    if (!trimmedDesc) {
      setValidationError('La descripción no puede estar vacía.');
      return;
    }

    if (!category) {
      setValidationError('Debes seleccionar una categoría.');
      return;
    }

    try {
      const result = await onSave(announcement.id, {
        title: trimmedTitle,
        description: trimmedDesc,
        category,
        expires_at: expiresAt || null,
      });

      if (result === false) {
        setSaveError('No se pudieron guardar los cambios. Intenta de nuevo.');
      }
    } catch (err) {
      setSaveError(err?.message || 'Error al guardar los cambios en el servidor.');
    }
  };

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) handleClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-announcement-title"
        className="modal-sheet"
        style={{
          maxHeight: '90dvh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          paddingBottom: 0,
        }}
      >
        {/* Cabecera */}
        <div style={{ marginBottom: '16px' }}>
          <h2
            id="edit-announcement-title"
            className="modal-header-title d-flex align-items-center gap-2"
            style={{ margin: 0 }}
          >
            <FiEdit3 style={{ color: 'var(--primary)' }} aria-hidden="true" />
            <span>Editar Anuncio</span>
          </h2>
        </div>

        {/* Modal de confirmación de descarte por cierre accidental */}
        {showDiscardConfirm ? (
          <div
            style={{
              padding: '20px 0',
              textAlign: 'center',
            }}
          >
            <FiAlertCircle size={40} style={{ color: 'var(--warning)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
              ¿Descartar los cambios?
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              marginBottom: '20px',
            }}
            >
              Tienes modificaciones sin guardar. Si sales ahora, se perderán los cambios.
            </p>
            <div className="modal-actions-grid">
              <button
                type="button"
                className="btn-cta btn-cta-outline"
                onClick={() => setShowDiscardConfirm(false)}
                style={{ minHeight: '44px' }}
              >
                Continuar editando
              </button>
              <button
                type="button"
                className="btn-cta btn-cta-primary"
                onClick={onClose}
                style={{
                  minHeight: '44px',
                  backgroundColor: 'var(--status-rejected)',
                  boxShadow: 'none',
                }}
              >
                Sí, descartar cambios
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              overflowY: 'auto',
            }}
          >
            {/* Mensajes de error globales */}
            {saveError && (
              <div
                role="alert"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--status-rejected)',
                  color: 'var(--status-rejected)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  fontSize: '13px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <FiAlertCircle size={18} aria-hidden="true" />
                <span>{saveError}</span>
              </div>
            )}

            {validationError && (
              <div
                role="alert"
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid var(--warning)',
                  color: 'var(--warning)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  fontSize: '13px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <FiAlertCircle size={18} aria-hidden="true" />
                <span>{validationError}</span>
              </div>
            )}

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
              {/* Título */}
              <div className="mb-3">
                <label
                  htmlFor="edit-announcement-title-input"
                  className="form-label"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Título del anuncio
                </label>
                <input
                  ref={titleInputRef}
                  id="edit-announcement-title-input"
                  type="text"
                  className="form-control form-elevated"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setValidationError(null);
                  }}
                  maxLength={TITLE_MAX_LENGTH}
                  required
                  style={{ fontSize: '16px' }}
                />
              </div>

              {/* Descripción */}
              <div className="mb-3">
                <label
                  htmlFor="edit-announcement-desc-input"
                  className="form-label"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Descripción
                </label>
                <textarea
                  id="edit-announcement-desc-input"
                  className="form-control form-elevated"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setValidationError(null);
                  }}
                  rows={3}
                  maxLength={DESCRIPTION_MAX_LENGTH}
                  required
                  style={{ fontSize: '16px' }}
                />
                <div className="char-counter">
                  {description.length}/{DESCRIPTION_MAX_LENGTH}
                </div>
              </div>

              {/* Categoría con optgroup */}
              <div className="mb-3">
                <label
                  htmlFor="edit-announcement-cat-select"
                  className="form-label"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Categoría
                </label>
                <select
                  id="edit-announcement-cat-select"
                  className="form-select form-elevated"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setValidationError(null);
                  }}
                  required
                  style={{ fontSize: '16px' }}
                >
                  <option value="">Selecciona una categoría</option>
                  <optgroup label="Productos">
                    {CATEGORIES.productos.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Servicios">
                    {CATEGORIES.servicios.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Vigencia */}
              <div className="mb-4">
                <label
                  htmlFor="edit-announcement-expiry-input"
                  className="form-label"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Renovar / Extender vigencia (hasta 30 días)
                </label>
                <input
                  id="edit-announcement-expiry-input"
                  type="date"
                  className="form-control form-elevated"
                  value={expiresAt}
                  min={today}
                  max={maxExpiry}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  style={{ fontSize: '16px' }}
                />
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Rango permitido: hoy hasta {maxExpiry}.
                </div>
              </div>
            </div>

            {/* Acciones sticky al fondo con safe-area */}
            <div
              style={{
                position: 'sticky',
                bottom: 0,
                backgroundColor: 'var(--bg-surface)',
                borderTop: '1px solid var(--border)',
                padding: '16px 0',
                paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
                zIndex: 10,
                marginTop: 'auto',
              }}
            >
              <div className="modal-actions-grid">
                <button
                  type="button"
                  className="btn-cta btn-cta-outline"
                  disabled={busy}
                  onClick={handleClose}
                  style={{ minHeight: '44px' }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-cta btn-cta-primary"
                  disabled={busy}
                  aria-busy={busy}
                  style={{ minHeight: '44px', padding: '0 20px' }}
                >
                  {busy && (
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                  )}
                  <span>{busy ? 'Guardando…' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

AnnouncementEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  announcement: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    title: PropTypes.string,
    description: PropTypes.string,
    custom_category: PropTypes.string,
    category_name: PropTypes.string,
    expires_at: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  busy: PropTypes.bool,
};
