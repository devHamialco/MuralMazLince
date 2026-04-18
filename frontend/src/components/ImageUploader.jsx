/* ImageUploader - wireframes-spec.md WF-3.4.3 */
/* Referencia: DDC 2.5, wireframes-spec.md */

import { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import imageCompression from 'browser-image-compression';
import { FiImage, FiX } from 'react-icons/fi';

const MAX_SIZE_MB = 0.5;
const MAX_WIDTH_OR_HEIGHT = 1200;

export default function ImageUploader({ onImageChange, initialImage, disabled = false }) {
  const [preview, setPreview] = useState(initialImage || null);
  const [state, setState] = useState('idle'); // idle, compressing, uploading, error
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