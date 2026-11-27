import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  FiFolderPlus,
  FiFolder,
  FiTrash2,
  FiRotateCcw,
} from 'react-icons/fi';
import CategoryChipPanel from './CategoryChipPanel';
import ImageUploader from './ImageUploader';
import ImageCropper, { createCroppedFile } from './ImageCropper';
import { useAuth } from '../context/AuthContext';

const DESCRIPTION_MAX_LENGTH = 1000;
const NAME_MAX_LENGTH = 120;
const NAME_MIN_LENGTH = 3;
const AUTOSAVE_DELAY_MS = 500;

// Clave antigua (global, compartida entre usuarios). Se elimina al montar.
const LEGACY_DRAFT_KEY = 'mml_project_form_draft';
// Clave nueva: un borrador por usuario.
const DRAFT_KEY_PREFIX = 'mml_project_form_draft';

/* ---------- Helpers de borrador (nunca lanzan excepción) ---------- */
const readDraft = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeDraft = (key, draft) => {
  try {
    localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // Cuota llena o almacenamiento bloqueado: se ignora.
  }
};

const clearDraft = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignorar
  }
};

const hasDraftContent = (draft) => Boolean(
  draft && (draft.name?.trim() || draft.description?.trim() || draft.category),
);

/**
 * ProjectForm — Formulario accesible de creación de proyectos (v2).
 *
 * Correcciones respecto a la versión anterior:
 * 1. El borrador solo se borra si el envío tuvo éxito (onSubmit !== false).
 *    Si falla, el usuario conserva lo escrito.
 * 2. Borrador por usuario (clave con user.id) y limpieza de la clave global antigua.
 * 3. Autoguardado con debounce de 500 ms y guardado final al desmontar.
 *    Un borrador vacío se elimina en lugar de guardarse.
 * 4. Al fallar la validación, el foco pasa al primer campo con error.
 * 5. Aviso visible "Recuperamos tu borrador" con botón para descartarlo.
 * 6. Se puede quitar el logotipo y cancelar un recorte en curso.
 * 7. Candado contra doble envío (incluye el tiempo de procesar el recorte).
 * 8. Se respeta el límite de proyectos activos (prop projectLimitReached).
 * 9. Error general visible si onSubmit lanza una excepción.
 * 10. El encabezado interno es opcional (showHeader) para evitar el título duplicado.
 */
export default function ProjectForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  submitting,
  projectLimitReached = false,
  showHeader = false,
}) {
  const { user } = useAuth();
  const draftKey = `${DRAFT_KEY_PREFIX}_${user?.id ?? 'anon'}`;

  const [expandedCategoryVariant, setExpandedCategoryVariant] = useState(null);
  const [errors, setErrors] = useState({});
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [cropAreaPixels, setCropAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [logoPreview, setLogoPreview] = useState(value.logoPreview || null);
  const [logoBase64, setLogoBase64] = useState(value.logoBase64 || null);
  const [processing, setProcessing] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  const nameInputRef = useRef(null);
  const categoryRef = useRef(null);
  const submittedRef = useRef(false);
  const latestDraftRef = useRef({ name: '', description: '', category: '' });
  const draftKeyRef = useRef(draftKey);

  const busy = Boolean(submitting) || processing;

  // Mantener referencias al último estado para el guardado al desmontar
  latestDraftRef.current = {
    name: value.name || '',
    description: value.description || '',
    category: value.category || '',
  };
  draftKeyRef.current = draftKey;

  const clearError = (key) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  /* ------------------------------ Logotipo --------------------------- */

  const handleImageSelected = (_file, preview) => {
    setCropAreaPixels(null);
    setRawImageSrc(preview);
    setIsCropping(true);
  };

  // Devuelve { ok, b64 }. Se ejecuta al enviar el formulario (no hay botón de confirmación).
  const handleApplyCrop = async () => {
    if (!rawImageSrc || !cropAreaPixels) return { ok: false };
    try {
      const { preview } = await createCroppedFile(rawImageSrc, cropAreaPixels);
      const b64 = preview.replace(/^data:image\/[a-z]+;base64,/, '');
      setLogoBase64(b64);
      setLogoPreview(preview);
      onChange({ ...value, logoBase64: b64, logoPreview: preview });
      return { ok: true, b64 };
    } catch {
      return { ok: false };
    }
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    setRawImageSrc(null);
    setCropAreaPixels(null);
  };

  const handleChangeImage = () => {
    document.getElementById('project-logo-uploader-input')?.click();
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoBase64(null);
    setRawImageSrc(null);
    setCropAreaPixels(null);
    setIsCropping(false);
    onChange({ ...value, logoBase64: null, logoPreview: null });
  };

  /* ------------------------------ Borrador --------------------------- */

  // Restaurar borrador al montar (solo si el formulario está vacío)
  useEffect(() => {
    clearDraft(LEGACY_DRAFT_KEY);

    const parsed = readDraft(draftKey);
    if (hasDraftContent(parsed) && !value.name && !value.description && !value.category) {
      onChange({
        ...value,
        name: parsed.name || '',
        description: parsed.description || '',
        category: parsed.category || '',
      });
      setDraftRestored(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autoguardado con debounce
  useEffect(() => {
    if (submittedRef.current) return undefined;

    const timer = setTimeout(() => {
      const draft = latestDraftRef.current;
      if (hasDraftContent(draft)) {
        writeDraft(draftKey, draft);
      } else {
        clearDraft(draftKey);
      }
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [value.name, value.description, value.category, draftKey]);

  // Guardado final al desmontar (p. ej. si el usuario pulsa "Cancelar" a medio escribir)
  useEffect(() => () => {
    if (submittedRef.current) return;
    const draft = latestDraftRef.current;
    if (hasDraftContent(draft)) {
      writeDraft(draftKeyRef.current, draft);
    } else {
      clearDraft(draftKeyRef.current);
    }
  }, []);

  const handleDiscardDraft = () => {
    clearDraft(draftKey);
    onChange({ ...value, name: '', description: '', category: '' });
    setErrors({});
    setDraftRestored(false);
  };

  /* ----------------------------- Validación -------------------------- */

  const validate = () => {
    const newErrors = {};
    const trimmedName = value.name?.trim() || '';

    if (!trimmedName) {
      newErrors.name = 'El nombre del proyecto es obligatorio.';
    } else if (trimmedName.length < NAME_MIN_LENGTH) {
      newErrors.name = `El nombre debe tener al menos ${NAME_MIN_LENGTH} caracteres.`;
    }

    if (!value.category) {
      newErrors.category = 'Selecciona una categoría principal.';
    }

    setErrors(newErrors);
    return newErrors;
  };

  const focusFirstError = (found) => {
    if (found.name) {
      nameInputRef.current?.focus();
    } else if (found.category) {
      categoryRef.current?.focus();
      categoryRef.current?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    }
  };

  /* ------------------------------ Handlers --------------------------- */

  const handleCategorySelect = (category) => {
    onChange({ ...value, category });
    clearError('category');
    clearError('form');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (busy || projectLimitReached) return;

    const found = validate();
    if (Object.keys(found).length > 0) {
      focusFirstError(found);
      return;
    }

    setProcessing(true);
    try {
      let selectedLogoBase64 = logoBase64 || value.logoBase64 || null;

      // Si hay un recorte pendiente se aplica ahora; si falla, no se crea el
      // proyecto sin el logotipo en silencio.
      if (isCropping) {
        const cropResult = await handleApplyCrop();
        if (!cropResult.ok) {
          setErrors((prev) => ({
            ...prev,
            logo: 'No se pudo procesar el recorte del logotipo. Ajusta la imagen o descártala e inténtalo de nuevo.',
          }));
          return;
        }
        selectedLogoBase64 = cropResult.b64;
      }

      const result = await onSubmit(
        value.name.trim(),
        value.description?.trim() || '',
        value.category,
        selectedLogoBase64,
      );

      // Solo se descarta el borrador si el envío no falló
      if (result !== false) {
        submittedRef.current = true;
        clearDraft(draftKey);
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        form: 'No se pudo crear el proyecto. Revisa tu conexión e inténtalo de nuevo.',
      }));
    } finally {
      setProcessing(false);
    }
  };

  /* -------------------------------- Render --------------------------- */

  return (
    <div className="form-shell">
      <div className="form-card" style={{ paddingBottom: 0 }}>
        {showHeader && (
          <h2 className="form-header-title" style={{ fontSize: '18px' }}>
            <FiFolderPlus style={{ color: 'var(--primary)' }} aria-hidden="true" />
            <span>Nuevo Proyecto</span>
          </h2>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Aviso de borrador recuperado */}
          {draftRestored && (
            <div
              role="status"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
                padding: '10px 14px',
                marginBottom: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                fontSize: '13px',
                color: 'var(--text-secondary)',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <FiRotateCcw aria-hidden="true" style={{ color: 'var(--primary)' }} />
                Recuperamos tu borrador anterior.
              </span>
              <button
                type="button"
                className="btn-cta btn-cta-outline btn-cta-sm"
                onClick={handleDiscardDraft}
                style={{ minHeight: '40px', padding: '0 14px' }}
              >
                Descartar
              </button>
            </div>
          )}

          {/* Logo del proyecto */}
          <div className="mb-4 text-center">
            <span
              className="form-label d-block text-center"
              style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}
            >
              Logotipo del proyecto (opcional)
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '84px',
                  height: '84px',
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
                  <FiFolder size={32} style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
                )}
              </div>

              <div
                style={
                  isCropping
                    ? { display: 'none' }
                    : { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }
                }
              >
                <ImageUploader
                  id="project-logo-uploader"
                  onImageChange={handleImageSelected}
                  buttonText={logoPreview ? 'Cambiar logotipo' : 'Subir logotipo'}
                />
                {logoPreview && (
                  <button
                    type="button"
                    className="btn-cta btn-cta-outline btn-cta-sm"
                    onClick={handleRemoveLogo}
                    disabled={busy}
                    style={{ minHeight: '44px', gap: '6px', display: 'inline-flex', alignItems: 'center' }}
                  >
                    <FiTrash2 aria-hidden="true" />
                    <span>Quitar</span>
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
                  Ajusta el recorte. Se aplicará al crear el proyecto.
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

          {/* Nombre del proyecto */}
          <div className="mb-3">
            <label
              htmlFor="project-name"
              className="form-label"
              style={{ color: 'var(--text-secondary)' }}
            >
              Nombre del proyecto
            </label>
            <input
              id="project-name"
              ref={nameInputRef}
              type="text"
              className="form-control form-elevated"
              placeholder="Ej: Repostería Artesanal Mazatlán"
              value={value.name ?? ''}
              onChange={(e) => {
                onChange({ ...value, name: e.target.value });
                clearError('name');
                clearError('form');
              }}
              maxLength={NAME_MAX_LENGTH}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'project-name-error' : undefined}
              required
              style={{ color: 'var(--text-primary)', fontSize: '16px' }}
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
                  id="project-name-error"
                  role="alert"
                  style={{ color: 'var(--status-rejected)', fontSize: '12px', margin: 0 }}
                >
                  {errors.name}
                </p>
              ) : <span />}
              <span className="char-counter" style={{ margin: 0 }}>
                {(value.name || '').length}/{NAME_MAX_LENGTH}
              </span>
            </div>
          </div>

          {/* Categoría */}
          <fieldset
            ref={categoryRef}
            tabIndex={-1}
            className="mb-3"
            style={{ border: 'none', padding: 0, margin: 0, outline: 'none' }}
            aria-describedby={errors.category ? 'project-category-error' : undefined}
          >
            <legend
              className="form-label"
              style={{
                color: 'var(--text-secondary)',
                fontSize: '14px',
                marginBottom: '8px',
                display: 'block',
              }}
            >
              Categoría principal
            </legend>

            <CategoryChipPanel
              selectedCategory={value.category}
              onCategorySelect={handleCategorySelect}
              expandedVariant={expandedCategoryVariant}
              setExpandedVariant={setExpandedCategoryVariant}
            />

            {errors.category && (
              <p
                id="project-category-error"
                role="alert"
                style={{ color: 'var(--status-rejected)', fontSize: '12px', marginTop: '4px' }}
              >
                {errors.category}
              </p>
            )}
          </fieldset>

          {/* Descripción */}
          <div className="mb-4">
            <label
              htmlFor="project-description"
              className="form-label"
              style={{ color: 'var(--text-secondary)' }}
            >
              Descripción <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span>
            </label>
            <textarea
              id="project-description"
              className="form-control form-elevated"
              placeholder="Cuéntanos brevemente sobre tu emprendimiento"
              value={value.description ?? ''}
              onChange={(event) => {
                onChange({ ...value, description: event.target.value });
                clearError('form');
              }}
              rows={4}
              maxLength={DESCRIPTION_MAX_LENGTH}
              style={{ color: 'var(--text-primary)', fontSize: '16px' }}
            />
            <div className="char-counter">
              {(value.description || '').length}/{DESCRIPTION_MAX_LENGTH} caracteres
            </div>
          </div>

          {/* Barra de acciones sticky al fondo */}
          <div
            className="form-actions-sticky"
            style={{
              position: 'sticky',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'var(--bg-base)',
              borderTop: '1px solid var(--border)',
              padding: '12px 0',
              paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              zIndex: 10,
              marginTop: 'var(--spacing-md)',
            }}
          >
            {projectLimitReached && (
              <p
                role="status"
                style={{ margin: 0, fontSize: '13px', color: 'var(--warning)' }}
              >
                Alcanzaste el límite de proyectos activos. Suspende uno para crear otro.
              </p>
            )}

            {errors.form && (
              <p
                role="alert"
                style={{ margin: 0, fontSize: '13px', color: 'var(--status-rejected)' }}
              >
                {errors.form}
              </p>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn-cta btn-cta-outline"
                onClick={onCancel}
                disabled={busy}
                style={{
                  flex: 1,
                  minHeight: '48px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="btn-cta btn-cta-primary"
                disabled={busy || projectLimitReached}
                aria-busy={busy}
                style={{ flex: 2, minHeight: '48px', padding: '0 24px' }}
              >
                {busy && (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                )}
                <span>{busy ? 'Creando proyecto…' : 'Crear Proyecto'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

ProjectForm.propTypes = {
  value: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    logoPreview: PropTypes.string,
    logoBase64: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  projectLimitReached: PropTypes.bool,
  showHeader: PropTypes.bool,
};
