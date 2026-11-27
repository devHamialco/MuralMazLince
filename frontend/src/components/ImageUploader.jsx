/**
 * @fileoverview ImageUploader — Zona de subida con compresión y preview (T15, implementacion-11.md)
 *
 * Flujo:
 *   1. El usuario toca el botón para seleccionar una imagen.
 *   2. Se valida tipo (JPEG/PNG) y tamaño máximo (10 MB antes de comprimir).
 *   3. `browser-image-compression` reduce el archivo a MAX_SIZE_MB con barra de progreso.
 *   4. Se genera un preview local en base64 para el recortador.
 *   5. `onImageChange(compressedFile, base64Preview)` notifica al padre para enviar al backend.
 */

import { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import imageCompression from 'browser-image-compression';
import { FiImage } from 'react-icons/fi';

const MAX_SIZE_MB = 0.5;
const MAX_WIDTH_OR_HEIGHT = 1200;

export default function ImageUploader({
  id = 'image-uploader',
  onImageChange = null,
  disabled = false,
  buttonText = 'Subir imagen',
}) {
  const [state, setState] = useState('idle'); // idle, compressing, error
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

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

      const reader = new FileReader();
      reader.onload = (e) => {
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
      // eslint-disable-next-line no-console
      console.error('Compression error:', err);
      return null;
    }
  }, [onImageChange]);

  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida (JPG o PNG)');
      setState('error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen no puede superar 10 MB');
      setState('error');
      return;
    }

    await compressImage(file);
  }, [compressImage]);

  const handleClick = () => {
    if (!disabled && state === 'idle') {
      inputRef.current?.click();
    }
  };

  return (
    <div>
      <button
        type="button"
        id={id}
        className="btn-cta btn-cta-outline btn-cta-sm"
        onClick={handleClick}
        disabled={disabled || state === 'compressing'}
        style={{
          minHeight: '44px',
          padding: '0 14px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
        }}
        aria-busy={state === 'compressing'}
      >
        <FiImage size={18} aria-hidden="true" />
        {state === 'compressing' ? `Optimizando imagen… ${progress}%` : buttonText}
      </button>

      <input
        ref={inputRef}
        id={`${id}-input`}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileSelect}
        disabled={disabled}
        style={{ display: 'none' }}
        aria-hidden="true"
        tabIndex={-1}
      />
      {error && (
        <p role="alert" style={{ color: 'var(--status-rejected)', fontSize: '12px', marginTop: '6px' }}>
          {error}
        </p>
      )}
    </div>
  );
}

ImageUploader.propTypes = {
  id: PropTypes.string,
  onImageChange: PropTypes.func,
  disabled: PropTypes.bool,
  buttonText: PropTypes.string,
};
