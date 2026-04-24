/**
 * @fileoverview LikeButton — Toggle de like con animación y contador (T15, implementacion-11.md)
 *
 * Comportamiento:
 *   - Modo interactivo (ROL-02/ROL-03): toggle activo/inactivo con animación pop.
 *   - Modo readonly (ROL-01 visitante): botón deshabilitado con tooltip.
 *
 * Lógica de umbral de intención:
 *   El timestamp de cada acción (like / unlike) se registra en el
 *   componente padre o en el store para que el backend pueda determinar si
 *   la acción fue accidental (RFC-14, ventana < 5000 ms).
 *
 * Referencia: SRS RF-12, RF-14, RN-08, wireframes-spec WF-3.3.1
 */

import PropTypes from 'prop-types';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

/**
 * Botón de like con contador y animación de pop.
 *
 * @param {object}   props
 * @param {boolean}  [props.liked=false]    - Si el usuario ya dio like.
 * @param {number}   [props.count=0]        - Número total de likes activos (no revertidos ni accidentales).
 * @param {Function} [props.onClick]        - Callback `() => void` al hacer click en modo interactivo.
 * @param {boolean}  [props.disabled=false] - Si `true`, no dispara onClick y muestra tooltip de registro.
 * @param {number}   [props.size=20]        - Tamaño del ícono en px.
 */
export default function LikeButton({
  liked = false, 
  count = 0, 
  onClick, 
  disabled = false,
  size = 20,
}) {
  /**
   * Gestiona el click previniendo propagación al contenedor padre.
   * No invoca `onClick` si el componente está deshabilitado.
   *
   * @param {React.MouseEvent} e
   */
  const handleClick = (e) => {
    e.stopPropagation();
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      className="d-inline-flex align-items-center gap-1"
      onClick={handleClick}
      disabled={disabled}
      aria-label={liked ? 'Quitar like' : 'Dar like'}
      aria-pressed={liked}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: 'transparent',
        border: 'none',
        padding: '4px',
        cursor: disabled ? 'pointer' : 'pointer',
        color: liked ? 'var(--primary)' : 'var(--text-muted)',
        transition: 'transform var(--transition-fast)',
        borderRadius: '4px',
      }}
      title={disabled ? 'Regístrate para valorar' : undefined}
    >
      <span
        style={{
          display: 'inline-flex',
          fontSize: `${size}px`,
        }}
        className={liked ? 'pop-animation' : ''}
      >
        {liked ? <FaHeart /> : <FaRegHeart />}
      </span>
      {count !== undefined && (
        <span style={{ fontSize: '12px', color: 'inherit' }}>
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