import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FiPlusCircle } from 'react-icons/fi';
import ImageUploader from './ImageUploader';
import ImageCropper, { createCroppedFile } from './ImageCropper';
import CategoryChipPanel from './CategoryChipPanel';

const DESCRIPTION_MAX_LENGTH = 1000;
const TITLE_MAX_LENGTH = 120;
const DRAFT_STORAGE_KEY = 'mml_announcement_form_draft';

const toInputDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * AnnouncementForm — Formulario de publicación de anuncios optimizado para móvil.
 *
 * Mejoras aplicadas:
 * 1. Carga cognitiva reducida y reordenada:
 *    1) Foto, 2) Título y categoría, 3) Descripción, 4) Vigencia.
 * 2. Barra de acciones sticky al fondo con soporte para safe-area-inset-bottom.
 * 3. Accesibilidad completa: <fieldset><legend> para chips, <label> real para uploader,
 *    aria-invalid y aria-describedby.
 * 4. Validación visible en línea de errores.
 * 5. Compresión en cliente con ImageUploader y aspect-ratio 4/3.
 * 6. Autoguardado de borrador en localStorage.
 * 7. Preselección automática de proyecto si solo hay uno activo.
 * 8. Atajos rápidos de vigencia ("7 días", "15 días", "30 días").
 * 9. Copy unificado a tuteo neutro (es-MX).
 */
export default function AnnouncementForm({
  projects,
  value,
  onChange,
  selectedProject = null,
  onSelectProject,
  onSubmit,
  onCancel,
  submitting,
  onCreateProject = () => {},
}) {
  const [expandedCategoryVariant, setExpandedCategoryVariant] = useState(null);
  const [cropSource, setCropSource] = useState(value.imagePreview || null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [errors, setErrors] = useState({});

  const activeProjects = useMemo(
    () => projects.filter((p) => p.status === 'active'),
    [projects],
  );

  // Preselección automática si hay exactamente un proyecto activo
  useEffect(() => {
    if (activeProjects.length === 1 && !selectedProject) {
      onSelectProject(activeProjects[0].id);
    }
  }, [activeProjects, selectedProject, onSelectProject]);

  // Autoguardado de borrador en localStorage
  useEffect(() => {
    const draft = {
      title: value.title || '',
      description: value.description || '',
      category: value.category || '',
      expires_at: value.expires_at || '',
      selectedProject: selectedProject || '',
      imagePreview: value.imagePreview || null,
    };
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Ignorar quota errors de localStorage
    }
  }, [value, selectedProject]);

  // Restaurar borrador al montar si el formulario está vacío
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved && !value.title && !value.description && !value.category) {
        const parsed = JSON.parse(saved);
        if (parsed.title || parsed.description || parsed.category) {
          onChange({
            ...value,
            title: parsed.title || '',
            description: parsed.description || '',
            category: parsed.category || '',
            expires_at: parsed.expires_at || '',
            imagePreview: parsed.imagePreview || null,
          });
          setCropSource(parsed.imagePreview || null);
          if (parsed.selectedProject && !selectedProject) {
            onSelectProject(parsed.selectedProject);
          }
        }
      }
    } catch {
      // Fallback silencioso si el JSON es inválido
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { today, maxExpiry } = useMemo(() => {
    const dateToday = toInputDate(new Date());
    const maxExpiryDate = new Date();
    maxExpiryDate.setDate(maxExpiryDate.getDate() + 30);
    return { today: dateToday, maxExpiry: toInputDate(maxExpiryDate) };
  }, []);

  const handleImageChange = useCallback((file, preview) => {
    setCropSource(preview);
    setCroppedAreaPixels(null);
    onChange({ ...value, image: file, imagePreview: preview });
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.image;
      return updated;
    });
  }, [onChange, value]);

  const handleCategorySelect = (category) => {
    onChange({ ...value, category });
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.category;
      return updated;
    });
  };

  const handleShortcutDays = (days) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    onChange({ ...value, expires_at: toInputDate(targetDate) });
  };

  const validate = () => {
    const newErrors = {};

    if (!selectedProject && activeProjects.length > 0) {
      newErrors.project = 'Selecciona un proyecto para tu anuncio';
    }
    if (!value.image && !value.imagePreview) {
      newErrors.image = 'Sube una fotografía para el anuncio';
    }
    if (!value.title?.trim()) {
      newErrors.title = 'El título del anuncio es obligatorio';
    } else if (value.title.trim().length < 5) {
      newErrors.title = 'El título debe tener al menos 5 caracteres';
    }
    if (!value.category) {
      newErrors.category = 'Selecciona una categoría';
    }
    if (!value.description?.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    } else if (value.description.trim().length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    let finalImage = value.image;
    if (cropSource && croppedAreaPixels) {
      try {
        const { file } = await createCroppedFile(cropSource, croppedAreaPixels);
        finalImage = file;
      } catch {
        setErrors((prev) => ({ ...prev, image: 'No se pudo recortar la imagen. Inténtalo de nuevo.' }));
        return;
      }
    }

    await onSubmit({
      title: value.title.trim(),
      description: value.description.trim(),
      category: value.category,
      image: finalImage,
      expires_at: value.expires_at || null,
      projectId: selectedProject,
    });

    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignorar errores de localStorage
    }
  };

  return (
    <div className="form-shell">
      <div className="form-card" style={{ paddingBottom: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 'var(--spacing-md)',
            borderBottom: '1px solid var(--border)',
            paddingBottom: 'var(--spacing-sm)',
          }}
        >
          <h2 className="form-header-title" style={{ margin: 0, fontSize: '18px' }}>
            <FiPlusCircle style={{ color: 'var(--primary)' }} aria-hidden="true" />
            <span>Nuevo Anuncio</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Proyecto asociado */}
          <div className="mb-3">
            <label
              htmlFor="announcement-project"
              className="form-label"
              style={{ color: 'var(--text-secondary)' }}
            >
              Asociar al proyecto
            </label>

            {activeProjects.length === 0 ? (
              <div
                style={{
                  border: '1px dashed var(--border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-elevated)',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    margin: '0 0 12px',
                  }}
                >
                  No tienes proyectos activos para publicar anuncios.
                </p>
                <button
                  type="button"
                  className="btn-cta btn-cta-primary btn-cta-sm"
                  onClick={onCreateProject}
                  style={{ minHeight: '40px', padding: '0 16px', margin: '0 auto' }}
                >
                  Crear proyecto primero
                </button>
              </div>
            ) : (
              <>
                <select
                  id="announcement-project"
                  className="form-select form-elevated"
                  value={selectedProject || ''}
                  onChange={(e) => {
                    onSelectProject(e.target.value);
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.project;
                      return copy;
                    });
                  }}
                  aria-invalid={Boolean(errors.project)}
                  aria-describedby={errors.project ? 'project-error' : undefined}
                  required
                >
                  <option value="">Selecciona un proyecto</option>
                  {activeProjects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {errors.project && (
                <p
                  id="project-error"
                  role="alert"
                  style={{ color: 'var(--status-rejected)', fontSize: '12px', marginTop: '4px' }}
                >
                  {errors.project}
                </p>
                )}
              </>
            )}
          </div>

          {/* SECCIÓN 1: Fotografía del producto / anuncio */}
          <div className="mb-4">
            <label
              htmlFor="announcement-image-uploader-input"
              className="form-label d-block"
              style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}
            >
              Fotografía del producto o promoción
            </label>

            <ImageUploader
              id="announcement-image-uploader"
              onImageChange={handleImageChange}
            />

            {cropSource && (
              <ImageCropper
                imageSrc={cropSource}
                onCropAreaChange={setCroppedAreaPixels}
              />
            )}

            {errors.image && (
            <p
              id="image-error"
              role="alert"
              style={{
                color: 'var(--status-rejected)',
                fontSize: '12px',
                marginTop: '6px',
                fontWeight: 500,
              }}
            >
              {errors.image}
            </p>
            )}
          </div>

          {/* SECCIÓN 2: Título y categoría */}
          <div className="mb-3">
            <label
              htmlFor="announcement-title"
              className="form-label"
              style={{ color: 'var(--text-secondary)' }}
            >
              Título del anuncio
            </label>
            <input
              id="announcement-title"
              type="text"
              className="form-control form-elevated"
              style={{ color: 'var(--text-primary)' }}
              placeholder="Ej: Promo 2x1 en Medialunas de manteca"
              value={value.title}
              onChange={(event) => {
                onChange({ ...value, title: event.target.value });
                setErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.title;
                  return copy;
                });
              }}
              maxLength={TITLE_MAX_LENGTH}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'title-error' : undefined}
              required
            />
            {errors.title && (
            <p
              id="title-error"
              role="alert"
              style={{ color: 'var(--status-rejected)', fontSize: '12px', marginTop: '4px' }}
            >
              {errors.title}
            </p>
            )}
          </div>

          <fieldset
            className="mb-3"
            style={{ border: 'none', padding: 0, margin: 0 }}
            aria-describedby={errors.category ? 'category-error' : undefined}
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
              Categoría
            </legend>

            <CategoryChipPanel
              selectedCategory={value.category}
              onCategorySelect={handleCategorySelect}
              expandedVariant={expandedCategoryVariant}
              setExpandedVariant={setExpandedCategoryVariant}
            />

            {errors.category && (
            <p
              id="category-error"
              role="alert"
              style={{ color: 'var(--status-rejected)', fontSize: '12px', marginTop: '4px' }}
            >
              {errors.category}
            </p>
            )}
          </fieldset>

          {/* SECCIÓN 3: Descripción detallada */}
          <div className="mb-3">
            <label
              htmlFor="announcement-description"
              className="form-label"
              style={{ color: 'var(--text-secondary)' }}
            >
              Descripción detallada
            </label>
            <textarea
              id="announcement-description"
              className="form-control form-elevated"
              style={{ color: 'var(--text-primary)' }}
              placeholder="Describe los detalles de tu producto, servicio o promoción…"
              value={value.description}
              onChange={(event) => {
                onChange({ ...value, description: event.target.value });
                setErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.description;
                  return copy;
                });
              }}
              rows={4}
              maxLength={DESCRIPTION_MAX_LENGTH}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'desc-error' : undefined}
              required
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '4px',
              }}
            >
              {errors.description ? (
                <p
                  id="desc-error"
                  role="alert"
                  style={{ color: 'var(--status-rejected)', fontSize: '12px', margin: 0 }}
                >
                  {errors.description}
                </p>
              ) : <span />}
              <span className="char-counter" style={{ margin: 0 }}>
                {value.description.length}/{DESCRIPTION_MAX_LENGTH}
              </span>
            </div>
          </div>

          {/* SECCIÓN 4: Vigencia con atajos rápidos */}
          <div className="mb-4">
            <label
              htmlFor="announcement-expiry"
              className="form-label"
              style={{ color: 'var(--text-secondary)' }}
            >
              Vigencia del anuncio (máximo 30 días)
            </label>

            {/* Botones de atajo rápido */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              {[
                { label: '7 días', days: 7 },
                { label: '15 días', days: 15 },
                { label: '30 días', days: 30 },
              ].map(({ label, days }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleShortcutDays(days)}
                  style={{
                    flex: 1,
                    minHeight: '36px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  +{label}
                </button>
              ))}
            </div>

            <input
              id="announcement-expiry"
              type="date"
              className="form-control form-elevated"
              value={value.expires_at}
              min={today}
              max={maxExpiry}
              onChange={(event) => onChange({ ...value, expires_at: event.target.value })}
            />

            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Si no seleccionas una fecha, vencerá automáticamente en 30 días.
            </div>
          </div>
        </form>

        {/* Barra de acciones sticky al fondo para alcance del pulgar */}
        <div
          className="form-actions-sticky"
          style={{
            position: 'sticky',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(15, 15, 17, 0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderTop: '1px solid var(--border)',
            padding: '12px 0',
            paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
            display: 'flex',
            gap: '12px',
            zIndex: 10,
            marginTop: 'var(--spacing-md)',
          }}
        >
          <button
            type="button"
            className="btn-cta btn-cta-outline"
            onClick={onCancel}
            disabled={submitting}
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
            type="button"
            onClick={handleSubmit}
            className="btn-cta btn-cta-primary"
            disabled={submitting}
            aria-busy={submitting}
            style={{ flex: 2, minHeight: '48px', padding: '0 20px' }}
          >
            {submitting && (
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              />
            )}
            <span>{submitting ? 'Publicando anuncio…' : 'Publicar Anuncio'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

AnnouncementForm.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string,
    status: PropTypes.string,
  })).isRequired,
  value: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    category: PropTypes.string,
    image: PropTypes.instanceOf(File),
    imagePreview: PropTypes.string,
    expires_at: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  selectedProject: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onSelectProject: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  onCreateProject: PropTypes.func,
};
