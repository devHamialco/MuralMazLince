import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const LIKE_COOLDOWN_MS = 400; // Cooldown ágil contra doble tap accidental

/**
 * LikeButton — Botón accesible de like con micro-interacción y contador.
 *
 * Mejoras aplicadas:
 * 1. Cooldown reducido de 5000ms a 400ms para evitar bloqueos frustrantes al rectificar like.
 * 2. Target táctil cómodo de 44px de alto.
 * 3. Migración a declaración de función estándar sin defaultProps obsoletos.
 * 4. Animación pop respetando accesibilidad y preferencias del usuario.
 */
export default function LikeButton({
  liked = false,
  count = 0,
  onClick = null,
  disabled = false,
  size = 18,
}) {
  const [isCoolingDown, setIsCoolingDown] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();

    if (disabled) {
      if (onClick) onClick();
      return;
    }

    if (isCoolingDown) return;
    setIsCoolingDown(true);
    setTimeout(() => setIsCoolingDown(false), LIKE_COOLDOWN_MS);

    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      type="button"
      className="d-inline-flex align-items-center gap-1"
      onClick={handleClick}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={liked ? 'Quitar me gusta' : 'Dar me gusta'}
      aria-pressed={liked}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'transparent',
        border: 'none',
        minHeight: '44px',
        padding: '0 8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: liked ? 'var(--primary)' : 'var(--text-muted)',
        transition: 'transform var(--transition-fast)',
        borderRadius: 'var(--radius-sm)',
      }}
      title={disabled ? 'Inicia sesión para interactuar' : undefined}
    >
      <span
        style={{
          display: 'inline-flex',
          fontSize: `${size}px`,
        }}
        className={liked ? 'pop-animation' : ''}
        aria-hidden="true"
      >
        {liked ? <FaHeart /> : <FaRegHeart />}
      </span>
      {count !== undefined && (
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'inherit' }}>
          {count}
        </span>
      )}
    </button>
  );
}

LikeButton.propTypes = {
  liked: PropTypes.bool,
  count: PropTypes.number,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  size: PropTypes.number,
};
