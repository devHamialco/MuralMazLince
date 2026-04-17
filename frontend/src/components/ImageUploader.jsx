import { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import imageCompression from 'browser-image-compression';
import { FaCloudUploadAlt, FaTimes, FaImage } from 'react-icons/fa';

const MAX_SIZE_MB = 0.5;
const MAX_WIDTH_OR_HEIGHT = 1200;

export default function ImageUploader({ onImageChange, initialImage, disabled = false }) {
  const [preview, setPreview] = useState(initialImage || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const compressImage = useCallback(async (file) => {
    try {
      setError(null);
      setUploading(true);
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

      return compressedFile;
    } catch (err) {
      setError('Error al comprimir la imagen');
      console.error('Compression error:', err);
      return null;
    } finally {
      setUploading(false);
    }
  }, [onImageChange]);

  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen');
      return;
    }

    // Validar tamaño (antes de comprimir)
    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen no puede superar 10MB');
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
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    if (onImageChange) {
      onImageChange(null, null);
    }
  }, [onImageChange]);

  return (
    <div className="image-uploader">
      <div
        className={`upload-zone ${preview ? 'has-preview' : ''} ${disabled ? 'disabled' : ''} ${error ? 'has-error' : ''}`}
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: `2px dashed ${error ? 'var(--error)' : preview ? 'var(--primary)' : 'var(--bg-hover)'}`,
          borderRadius: 'var(--border-radius-lg)',
          padding: 'var(--spacing-xl)',
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: 'var(--bg-elevated)',
          transition: 'all var(--transition-fast)',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={preview ? 'Cambiar imagen' : 'Subir imagen'}
      >
        {uploading ? (
          <div className="upload-progress">
            <div className="spinner-border text-primary mb-2" role="status">
              <span className="visually-hidden">Comprimiendo...</span>
            </div>
            <p className="text-muted mb-0">Comprimiendo imagen... {progress}%</p>
            <div 
              className="progress mt-2" 
              style={{ width: '80%', height: '6px' }}
            >
              <div 
                className="progress-bar bg-primary" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : preview ? (
          <div className="preview-container" style={{ position: 'relative', width: '100%' }}>
            <img 
              src={preview} 
              alt="Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '300px', 
                borderRadius: 'var(--border-radius-md)',
                objectFit: 'contain',
              }} 
            />
            {!disabled && (
              <button
                type="button"
                className="btn btn-sm btn-danger position-absolute"
                onClick={handleClear}
                style={{ 
                  position: 'absolute', 
                  top: '8px', 
                  right: '8px',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  padding: 0,
                }}
                aria-label="Eliminar imagen"
              >
                <FaTimes />
              </button>
            )}
          </div>
        ) : (
          <>
            <FaCloudUploadAlt 
              size={48} 
              color="var(--text-muted)" 
              className="mb-3"
            />
            <p className="text-primary mb-1" style={{ fontWeight: 500 }}>
              Toca o arrastra una imagen
            </p>
            <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
              Máx 500KB después de comprimir
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="text-error mt-2" style={{ color: 'var(--error)', fontSize: '0.875rem' }}>
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
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