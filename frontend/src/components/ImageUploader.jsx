/**
 * @fileoverview ImageUploader — Zona de subida con compresión y preview (T15, implementacion-11.md)
 *
 * Flujo:
 *   1. El usuario arrastra o toca para seleccionar una imagen.
 *   2. Se valida tipo (JPEG/PNG) y tamaño máximo (10 MB antes de comprimir).
 *   3. `browser-image-compression` reduce el archivo a MAX_SIZE_MB con barra de progreso.
 *   4. Se genera un preview local en base64.
 *   5. `onImageChange(compressedFile, base64Preview)` notifica al padre para enviar al backend.
 *
 * Límites actuales (descubiertos en el repositorio — regla 1 del sprint: no hardcodear):
 *   - MAX_SIZE_MB         = 0.5  (500 KB target post-compresión)
 *   - MAX_WIDTH_OR_HEIGHT = 1200 px
 *   - Formatos aceptados  = image/jpeg, image/png
 *
 * Referencia: SRS RNF-04, DDC 2.5, wireframes-spec WF-3.4.3
 */

import { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import imageCompression from 'browser-image-compression';
import { FiImage, FiX } from 'react-icons/fi';

const MAX_SIZE_MB = 0.5;
const MAX_WIDTH_OR_HEIGHT = 1200;

/**
 * Componente de subida de imagen con drag-and-drop, compresión automática y preview local.
 *
 * @param {object}        props
 * @param {Function}      [props.onImageChange]  - Callback `(file: File, preview: string) => void`
 *                                                 llamado cuando la imagen es seleccionada y comprimida.
 *                                                 Si el usuario limpia, se llama con `(null, null)`.
 * @param {string}        [props.initialImage]   - URL de imagen preexistente para mostrar como preview inicial.
 * @param {boolean}       [props.disabled=false] - Si `true`, deshabilita interacción y cursor.
 */
export default function ImageUploader({ onImageChange, initialImage, disabled = false }) {
  const [preview, setPreview] = useState(initialImage || null);
  const [state, setState] = useState('idle'); // idle, compressing, uploading, error
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  /**
   * Comprime el archivo usando `browser-image-compression` y emite el resultado.
   * Actualiza el estado de progreso (0-100) durante el proceso.
   *
   * @param   {File}           file - Archivo de imagen ya validado.
   * @returns {Promise<File|null>}   Archivo comprimido o `null` si falla.
   * @sideeffects Actualiza `state` ('compressing' | 'idle' | 'error'), `progress` y `preview`.
   */
  const compressImage = useCallback(async (file) => {
    try {
      setError(null);
      setState('compressing');
      setProgress(10);

      const options = {
        maxSizeMB: MAX_SIZE_MB,
        maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
        useWebWorker: true,
        onProgress: (p) => setProgress(Math.min(90, Math.round(p))),
      };

      setProgress(30);
      const compressedFile = await imageCompression(file, options);
      setProgress(100);

      // Convertir a base64 para preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        if (onImageChange) {
          onImageChange(compressedFile, e.target.result);
        }
      };
      reader.readAsDataURL(compressedFile);

      setState('idle');
      return compressedFile;
    } catch (err) {
      setError('Error al comprimir la imagen');
      setState('error');
      console.error('Compression error:', err);
      return null;
    }
  }, [onImageChange]);

  /**
   * Maneja la selección de archivos desde el input nativo.
   * Valida tipo y tamaño máximo (10 MB) antes de comprimir.
   *
   * @param   {React.ChangeEvent<HTMLInputElement>} e
   * @returns {Promise<void>}
   */
  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen');
      setState('error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen no puede superar 10MB');
      setState('error');
      return;
    }

    await compressImage(file);
  }, [compressImage]);

  /**
   * Maneja el evento `drop` de drag-and-drop.
   * Solo procesa el primer archivo soltado si es una imagen válida.
   *
   * @param   {React.DragEvent} e
   * @returns {Promise<void>}
   */
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await compressImage(file);
    }
  }, [disabled, compressImage]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  /**
   * Limpia el estado del componente y notifica al padre con `(null, null)`.
   * Resetea el input file para permitir re-seleccionar el mismo archivo.
   *
   * @param   {React.MouseEvent} e
   * @returns {void}
   */
  const handleClear = useCallback((e) => {
    e.stopPropagation();
    setPreview(null);
    setProgress(0);
    setError(null);
    setState('idle');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    if (onImageChange) {
      onImageChange(null, null);
    }
  }, [onImageChange]);

  const handleClick = () => {
    if (!disabled && state === 'idle') {
      inputRef.current?.click();
    }
  };

  return (
    <div onClick={handleClick}>
      <div
        style={{
          width: '343px',
          height: '200px',
          border: `2px dashed ${error ? 'var(--status-rejected)' : state !== 'idle' ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-card)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'border-color var(--transition-fast)',
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        role="button"
        tabIndex={disabled ? -1 : 0}
      >
        {state === 'compressing' || state === 'uploading' ? (
          <>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                {state === 'compressing' ? 'Optimizando imagen...' : 'Subiendo...'}
              </span>
              <div style={{ width: '80%', height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px' }}>
                <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '2px', transition: 'width 150ms' }} />
              </div>
            </div>
          </>
        ) : preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <button
              type="button"
              onClick={handleClear}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                backgroundColor: 'rgba(0,0,0,0.6)',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-primary)',
              }}
              aria-label="Eliminar imagen"
            >
              <FiX size={16} />
            </button>
          </>
        ) : state === 'error' ? (
          <div style={{ color: 'var(--status-rejected)', textAlign: 'center' }}>
            <FiX size={32} />
            <p style={{ fontSize: '12px', marginTop: '8px' }}>{error || 'Error'}</p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <FiImage size={32} />
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '4px' }}>
              Toca para subir una imagen
            </p>
            <p style={{ fontSize: '12px' }}>JPG, PNG, máx. 500 KB</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileSelect}
        disabled={disabled}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
    </div>
  );
}

ImageUploader.propTypes = {
  onImageChange: PropTypes.func,
  initialImage: PropTypes.string,
  disabled: PropTypes.bool,
};