import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Cropper from 'react-easy-crop';

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.2;
const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)';

const createImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.addEventListener('load', () => resolve(image), { once: true });
  image.addEventListener('error', () => reject(new Error('No se pudo cargar la imagen')), { once: true });
  image.crossOrigin = 'anonymous';
  image.src = src;
});

export const createCroppedFile = async (imageSrc, croppedAreaPixels = null) => {
  const image = await createImage(imageSrc);
  const naturalW = image.naturalWidth || image.width || 400;
  const naturalH = image.naturalHeight || image.height || 400;
  const area = croppedAreaPixels || {
    x: 0,
    y: 0,
    width: naturalW,
    height: naturalH,
  };
  const canvas = document.createElement('canvas');
  canvas.width = area.width;
  canvas.height = area.height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('No se pudo preparar el recorte');
  }

  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    area.width,
    area.height,
  );

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) {
        resolve(result);
      } else {
        reject(new Error('No se pudo generar el recorte'));
      }
    }, 'image/jpeg', 0.92);
  });

  return {
    file: new File([blob], 'anuncio-recortado.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now(),
    }),
    preview: canvas.toDataURL('image/jpeg', 0.92),
  };
};

export default function ImageCropper({
  imageSrc,
  onCropAreaChange = null,
  cropShape = 'rect',
  aspect = 4 / 3,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [isDesktop, setIsDesktop] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia(DESKTOP_MEDIA_QUERY).matches
  ));

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const handleChange = (event) => setIsDesktop(event.matches);
    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleCropComplete = useCallback((_, areaPixels) => {
    onCropAreaChange?.(areaPixels);
  }, [onCropAreaChange]);

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(MIN_ZOOM, Number((prev - ZOOM_STEP).toFixed(2))));
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(MAX_ZOOM, Number((prev + ZOOM_STEP).toFixed(2))));
  };

  const aspectHint = cropShape === 'round' ? 'circular' : '4:3';

  return (
    <section
      aria-label="Recortar fotografía"
      style={{
        marginTop: '12px',
        padding: '12px',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-surface)',
      }}
    >
      <p style={{ margin: '0 0 10px', color: 'var(--text-secondary)', fontSize: '13px' }}>
        {isDesktop
          ? `Ajusta el encuadre (${aspectHint}) arrastrando la imagen o usando los botones de zoom.`
          : `Ajusta el encuadre (${aspectHint}) arrastrando o pellizcando la imagen.`}
      </p>

      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '260px',
          overflow: 'hidden',
          borderRadius: cropShape === 'round' ? 'var(--radius-md)' : 'var(--radius-sm)',
          backgroundColor: '#111',
        }}
      >
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          cropShape={cropShape}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
        />
      </div>

      {isDesktop && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '12px',
          }}
        >
          <button
            type="button"
            className="btn-cta btn-cta-outline btn-cta-sm"
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Alejar imagen"
            style={{ minWidth: '40px', minHeight: '40px', padding: '0 12px', fontSize: '18px' }}
          >
            −
          </button>
          <span
            aria-live="polite"
            style={{
              minWidth: '48px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            className="btn-cta btn-cta-outline btn-cta-sm"
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Acercar imagen"
            style={{ minWidth: '40px', minHeight: '40px', padding: '0 12px', fontSize: '18px' }}
          >
            +
          </button>
        </div>
      )}
    </section>
  );
}

ImageCropper.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  onCropAreaChange: PropTypes.func,
  cropShape: PropTypes.oneOf(['rect', 'round']),
  aspect: PropTypes.number,
};
