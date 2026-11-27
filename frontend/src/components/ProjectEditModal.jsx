import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import {
  FiEdit2,
  FiAlertCircle,
  FiFolder,
  FiRotateCcw,
} from 'react-icons/fi';
import { CATEGORIES } from '../constants/categories';
import ImageUploader from './ImageUploader';
import ImageCropper, { createCroppedFile } from './ImageCropper';

const NAME_MAX_LENGTH = 120;
const NAME_MIN_LENGTH = 3;
const DESCRIPTION_MAX_LENGTH = 1000;

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

// Un elemento con display:none no tiene cajas de renderizado
const isVisible = (el) => el.getClientRects().length > 0;

const KNOWN_CATEGORIES = [...CATEGORIES.productos, ...CATEGORIES.servicios];

/* ------------------------------------------------------------------ */
/* Diálogo interno                                                     */
/* Se monta de nuevo cada vez que se abre (key = project.id), por lo   */
/* que el estado inicial sale directo del proyecto: sin efectos de     */
/* reinicio, sin parpadeo de campos vacíos y sin datos viejos.         */
/* ------------------------------------------------------------------ */

function ProjectEditDialog({ project, onClose, onSave, busy: busyProp = false }) {
  const initialName = project.name || '';
  const initialDescription = project.description || '';
  const initialCategory = project.category_name || '';
  const initialLogo = project.logo_url || null;

  // Si la categoría guardada no está en el catálogo, se conserva como opción
  // para no perderla ni mostrar el selector vacío por error.
  const extraCategory = initialCategory && !KNOWN_CATEGORIES.includes(initialCategory)
    ? initialCategory
    : null;

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [category, setCategory] = useState(initialCategory);
  const [logoPreview, setLogoPreview] = useState(initialLogo);
  const [logoBase64, setLogoBase64] = useState(null);
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [cropAreaPixels, setCropAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);

  const dialogRef = useRef(null);
  const nameInputRef = useRef(null);
  const categoryRef = useRef(null);
  const logoSectionRef = useRef(null);
  const continueBtnRef = useRef(null);
  const triggerElementRef = useRef(null);
  const focusBeforeConfirmRef = useRef(null);
  const overlayPressRef = useRef(false);

  const busy = Boolean(busyProp) || processing;

  const clearError = (key) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  /* --------------------------- Cambios sin guardar ------------------- */

  const isDirty = useMemo(
    () => (
      name.trim() !== initialName.trim()
      || description.trim() !== initialDescription.trim()
      || category !== initialCategory
      || Boolean(logoBase64)
      || (isCropping && Boolean(rawImageSrc))
    ),
    [
      name,
      description,
      category,
      logoBase64,
      isCropping,
      rawImageSrc,
      initialName,
      initialDescription,
      initialCategory,
    ],
  );

  const requestClose = useCallback(() => {
    if (busy) return;
    if (isDirty) {
      focusBeforeConfirmRef.current = document.activeElement;
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  }, [busy, isDirty, onClose]);

  /* ------------------------------ Logotipo --------------------------- */

  const handleImageSelected = (_file, preview) => {
    setCropAreaPixels(null);
    setRawImageSrc(preview);
    setIsCropping(true);
    clearError('logo');
  };

  // Devuelve { ok, b64 }. Nunca descarta en silencio una imagen pendiente.
  const applyCrop = async () => {
    if (!rawImageSrc) return { ok: false };
    try {
      const { preview } = await createCroppedFile(rawImageSrc, cropAreaPixels);
      const b64 = preview.replace(/^data:image\/[a-z]+;base64,/, '');
      setLogoBase64(b64);
      setLogoPreview(preview);
      return { ok: true, b64 };
    } catch {
      return { ok: false };
    }
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    setRawImageSrc(null);
    setCropAreaPixels(null);
    clearError('logo');
  };

  const handleChangeImage = () => {
    document.getElementById('edit-project-logo-uploader-input')?.click();
  };

  // Deshace un logotipo nuevo aún no guardado y vuelve al original
  const handleRestoreLogo = () => {
    setLogoBase64(null);
    setLogoPreview(initialLogo);
    setRawImageSrc(null);
    setCropAreaPixels(null);
    setIsCropping(false);
    clearError('logo');
  };

  /* -------------------------- Foco, scroll y teclado ----------------- */

  // Al abrir: recordar quién abrió el modal y mover el foco.
  // En pantallas táctiles el foco va al diálogo (no al input) para que no
  // se abra el teclado y tape el formulario.
  useEffect(() => {
    triggerElementRef.current = document.activeElement;
    const isTouch = window.matchMedia?.('(pointer: coarse)').matches;
    const timer = setTimeout(() => {
      if (isTouch) {
        dialogRef.current?.focus();
      } else {
        nameInputRef.current?.focus();
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      const trigger = triggerElementRef.current;
      if (trigger && document.contains(trigger)) trigger.focus?.();
    };
  }, []);

  // Bloqueo de scroll del fondo
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Escape + focus trap (ignora elementos ocultos)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (busy) return;
        e.preventDefault();
        if (showDiscardConfirm) {
          setShowDiscardConfirm(false);
        } else {
          requestClose();
        }
        return;
      }

      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR),
      ).filter(isVisible);

      if (focusable.length === 0) {
        e.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!dialogRef.current.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && (active === first || active === dialogRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [busy, showDiscardConfirm, requestClose]);

  // Foco al mostrar / ocultar la confirmación de descarte
  useEffect(() => {
    if (showDiscardConfirm) {
      continueBtnRef.current?.focus();
    } else if (focusBeforeConfirmRef.current) {
      const previous = focusBeforeConfirmRef.current;
      focusBeforeConfirmRef.current = null;
      if (document.contains(previous)) previous.focus?.();
    }
  }, [showDiscardConfirm]);

  // Llevar a la vista el error del logotipo (la sección puede estar fuera de pantalla)
  useEffect(() => {
    if (errors.logo) {
      logoSectionRef.current?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    }
  }, [errors.logo]);

  /* ------------------------------ Envío ------------------------------ */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;

    const trimmedName = name.trim();
    const trimmedDesc = description.trim();
    const found = {};

    if (!trimmedName) {
      found.name = 'El nombre del proyecto es obligatorio.';
    } else if (trimmedName.length < NAME_MIN_LENGTH) {
      found.name = `El nombre debe tener al menos ${NAME_MIN_LENGTH} caracteres.`;
    }

    if (!category) {
      found.category = 'Selecciona una categoría.';
    }

    setErrors(found);
    if (Object.keys(found).length > 0) {
      if (found.name) nameInputRef.current?.focus();
      else categoryRef.current?.focus();
      return;
    }

    setProcessing(true);
    try {
      let selectedLogoBase64 = logoBase64;

      // Si hay un recorte pendiente, se aplica; si falla, NO se guarda
      // sin el logotipo en silencio.
      if (isCropping) {
        const cropResult = await applyCrop();
        if (!cropResult.ok) {
          setErrors({
            logo: 'No se pudo procesar el recorte del logotipo. Ajusta la imagen o descártala e inténtalo de nuevo.',
          });
          return;
        }
        selectedLogoBase64 = cropResult.b64;
      }

      const result = await onSave(project.id, {
        name: trimmedName,
        description: trimmedDesc,
        category,
        logo_base64: selectedLogoBase64 || undefined,
      });

      if (result === false) {
        setErrors({ form: 'No se pudieron guardar los cambios. Inténtalo de nuevo.' });
      }
    } catch (err) {
      setErrors({ form: err?.message || 'Error al guardar los cambios en el servidor.' });
    } finally {
      setProcessing(false);
    }
  };

  /* ------------------------------ Render ----------------------------- */

  return (
    <div
      className="modal-overlay"
      role="presentation"
      // Solo se cierra si el gesto empezó Y terminó en el fondo. Así, arrastrar
      // para seleccionar texto y soltar fuera del panel ya no cierra el modal.
      onPointerDown={(e) => {
        overlayPressRef.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (overlayPressRef.current && e.target === e.currentTarget) requestClose();
        overlayPressRef.current = false;
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-project-title"
        tabIndex={-1}
        className="modal-sheet"
        style={{
          maxHeight: '90dvh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          paddingBottom: 0,
          outline: 'none',
        }}
      >
        <div style={{ marginBottom: '16px', flexShrink: 0 }}>
          <h2
            id="edit-project-title"
            className="modal-header-title d-flex align-items-center gap-2"
            style={{ margin: 0 }}
          >
            <FiEdit2 style={{ color: 'var(--primary)' }} aria-hidden="true" />
            <span>Editar Proyecto</span>
          </h2>
        </div>

        {/* Confirmación de descarte. El formulario sigue montado (solo oculto)
            para no perder el estado del recorte ni lo escrito. */}
        {showDiscardConfirm && (
          <div
            role="alertdialog"
            aria-labelledby="edit-project-discard-title"
            aria-describedby="edit-project-discard-desc"
            style={{ padding: '20px 0', textAlign: 'center' }}
          >
            <FiAlertCircle
              size={40}
              style={{ color: 'var(--warning)', marginBottom: '12px' }}
              aria-hidden="true"
            />
            <h3
              id="edit-project-discard-title"
              style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}
            >
              ¿Descartar los cambios?
            </h3>
            <p
              id="edit-project-discard-desc"
              style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}
            >
              Tienes modificaciones sin guardar en el proyecto. Si sales ahora, se perderán.
            </p>
            <div className="modal-actions-grid">
              <button
                ref={continueBtnRef}
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
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          style={{
            display: showDiscardConfirm ? 'none' : 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Zona con scroll: un solo contenedor desplazable */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              paddingRight: '4px',
              paddingBottom: '8px',
            }}
          >
            {/* Logo del proyecto */}
            <div ref={logoSectionRef} className="mb-4 text-center">
              <span
                className="form-label d-block text-center"
                style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}
              >
                Logotipo del proyecto
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid var(--primary)',
                    backgroundColor: 'var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo del proyecto"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <FiFolder size={30} style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
                  )}
                </div>

                <div
                  style={
                    isCropping
                      ? { display: 'none' }
                      : {
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                      }
                  }
                >
                  <ImageUploader
                    id="edit-project-logo-uploader"
                    onImageChange={handleImageSelected}
                    buttonText={logoPreview ? 'Cambiar logotipo' : 'Subir logotipo'}
                  />
                  {logoBase64 && (
                    <button
                      type="button"
                      className="btn-cta btn-cta-outline btn-cta-sm"
                      onClick={handleRestoreLogo}
                      disabled={busy}
                      style={{ minHeight: '44px', gap: '6px', display: 'inline-flex', alignItems: 'center' }}
                    >
                      <FiRotateCcw aria-hidden="true" />
                      <span>Deshacer</span>
                    </button>
                  )}
                </div>
              </div>

              {isCropping && rawImageSrc && (
                <div style={{ marginTop: '16px', textAlign: 'left' }}>
                  <ImageCropper
                    imageSrc={rawImageSrc}
                    onCropAreaChange={setCropAreaPixels}
                    cropShape="round"
                    aspect={1}
                  />
                  <p
                    style={{
                      margin: '10px 0 0 0',
                      fontSize: '12px',
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Ajusta el recorte. Se aplicará al guardar los cambios.
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      justifyContent: 'center',
                      flexWrap: 'wrap',
                      marginTop: '12px',
                    }}
                  >
                    <button
                      type="button"
                      className="btn-cta btn-cta-primary btn-cta-sm"
                      onClick={async () => {
                        const res = await applyCrop();
                        if (res.ok) {
                          setIsCropping(false);
                        }
                      }}
                      disabled={busy}
                      style={{ minHeight: '44px' }}
                    >
                      Confirmar recorte
                    </button>
                    <button
                      type="button"
                      className="btn-cta btn-cta-outline btn-cta-sm"
                      onClick={handleChangeImage}
                      disabled={busy}
                      style={{ minHeight: '44px' }}
                    >
                      Elegir otra
                    </button>
                    <button
                      type="button"
                      className="btn-cta btn-cta-outline btn-cta-sm"
                      onClick={handleCancelCrop}
                      disabled={busy}
                      style={{ minHeight: '44px' }}
                    >
                      Descartar imagen
                    </button>
                  </div>
                </div>
              )}

              {errors.logo && (
                <p
                  role="alert"
                  style={{ color: 'var(--status-rejected)', fontSize: '12px', marginTop: '8px', marginBottom: 0 }}
                >
                  {errors.logo}
                </p>
              )}
            </div>

            {/* Nombre */}
            <div className="mb-3">
              <label
                htmlFor="edit-project-name"
                className="form-label"
                style={{ color: 'var(--text-secondary)' }}
              >
                Nombre del proyecto
              </label>
              <input
                ref={nameInputRef}
                id="edit-project-name"
                type="text"
                className="form-control form-elevated"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError('name');
                  clearError('form');
                }}
                maxLength={NAME_MAX_LENGTH}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'edit-project-name-error' : undefined}
                required
                style={{ fontSize: '16px' }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '4px',
                }}
              >
                {errors.name ? (
                  <p
                    id="edit-project-name-error"
                    role="alert"
                    style={{ color: 'var(--status-rejected)', fontSize: '12px', margin: 0 }}
                  >
                    {errors.name}
                  </p>
                ) : <span />}
                <span className="char-counter" style={{ margin: 0 }}>
                  {name.length}/{NAME_MAX_LENGTH}
                </span>
              </div>
            </div>

            {/* Categoría */}
            <div className="mb-3">
              <label
                htmlFor="edit-project-category"
                className="form-label"
                style={{ color: 'var(--text-secondary)' }}
              >
                Categoría
              </label>
              <select
                ref={categoryRef}
                id="edit-project-category"
                className="form-select form-elevated"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  clearError('category');
                  clearError('form');
                }}
                aria-invalid={Boolean(errors.category)}
                aria-describedby={errors.category ? 'edit-project-category-error' : undefined}
                required
                style={{ fontSize: '16px' }}
              >
                <option value="">Selecciona una categoría</option>
                {extraCategory && (
                  <optgroup label="Actual">
                    <option value={extraCategory}>{extraCategory}</option>
                  </optgroup>
                )}
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
              {errors.category && (
                <p
                  id="edit-project-category-error"
                  role="alert"
                  style={{ color: 'var(--status-rejected)', fontSize: '12px', marginTop: '4px', marginBottom: 0 }}
                >
                  {errors.category}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className="mb-2">
              <label
                htmlFor="edit-project-description"
                className="form-label"
                style={{ color: 'var(--text-secondary)' }}
              >
                Descripción <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span>
              </label>
              <textarea
                id="edit-project-description"
                className="form-control form-elevated"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearError('form');
                }}
                rows={3}
                maxLength={DESCRIPTION_MAX_LENGTH}
                style={{ fontSize: '16px' }}
              />
              <div className="char-counter">
                {description.length}/{DESCRIPTION_MAX_LENGTH} caracteres
              </div>
            </div>
          </div>

          {/* Acciones: siempre visibles al fondo, fuera de la zona con scroll */}
          <div
            style={{
              flexShrink: 0,
              backgroundColor: 'var(--bg-surface)',
              borderTop: '1px solid var(--border)',
              padding: '16px 0',
              paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {errors.form && (
              <div
                role="alert"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--status-rejected)',
                  color: 'var(--status-rejected)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <FiAlertCircle size={18} aria-hidden="true" style={{ flexShrink: 0 }} />
                <span>{errors.form}</span>
              </div>
            )}

            <div className="modal-actions-grid">
              <button
                type="button"
                className="btn-cta btn-cta-outline"
                disabled={busy}
                onClick={requestClose}
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
      </div>
    </div>
  );
}

const projectShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  name: PropTypes.string,
  description: PropTypes.string,
  category_name: PropTypes.string,
  logo_url: PropTypes.string,
});

ProjectEditDialog.propTypes = {
  project: projectShape.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  busy: PropTypes.bool,
};

/* ------------------------------------------------------------------ */
/* Componente público (misma interfaz que la versión anterior)         */
/* ------------------------------------------------------------------ */

/**
 * ProjectEditModal — Bottom sheet accesible para editar proyectos (v2).
 *
 * Correcciones respecto a la versión anterior:
 * 1. Estado fresco en cada apertura (diálogo con key) en lugar de efectos de reinicio:
 *    elimina el parpadeo de campos vacíos y los datos viejos.
 * 2. El recorte se aplica al pulsar "Guardar Cambios" (sin botón de confirmación).
 *    Si falla, no se guarda el proyecto sin el logotipo y se explica el problema.
 * 3. La confirmación de descarte ya no desmonta el formulario (se conserva el recorte).
 * 4. Seleccionar texto y soltar fuera del panel ya no cierra el modal.
 * 5. Focus trap que ignora elementos ocultos (antes podía quedar atrapado en un botón invisible).
 * 6. En móvil el foco inicial va al diálogo, no al input, para no abrir el teclado de golpe.
 * 7. Validación propia con errores en línea (noValidate): se acabaron los globos nativos
 *    del navegador y ahora también se valida la categoría.
 * 8. Un solo contenedor con scroll; las acciones quedan fijas al fondo.
 * 9. Candado contra doble envío, "Deshacer" para un logotipo nuevo sin guardar,
 *    y la categoría existente se conserva aunque no esté en el catálogo.
 */
export default function ProjectEditModal({
  isOpen,
  project = null,
  onClose,
  onSave,
  busy = false,
}) {
  if (!isOpen || !project) return null;

  return (
    <ProjectEditDialog
      key={project.id}
      project={project}
      onClose={onClose}
      onSave={onSave}
      busy={busy}
    />
  );
}

ProjectEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  project: projectShape,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  busy: PropTypes.bool,
};
