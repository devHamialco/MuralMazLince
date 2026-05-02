/**
 * @fileoverview StarRating — Componente de valoración de 1 a 3 estrellas (T15, implementacion-11.md)
 *
 * Escala: 1, 2 o 3 estrellas (SAD §6.2, RF-13). No se usa la escala clásica de 5.
 *
 * Modos:
 *   - Interactivo (ROL-02/ROL-03): el usuario puede seleccionar su valoración.
 *   - Readonly   (ROL-01 visitante): solo visualización del promedio; no dispara mutación.
 *
 * Accesibilidad:
 *   - En modo readonly: `role="img"` con aria-label descriptivo.
 *   - En modo interactivo: `role="radiogroup"` con botones ARIA-pressed por estrella.
 *
 * Referencia: SRS RF-13, RN-08, wireframes-spec WF-3.3.1
 */

import PropTypes from 'prop-types';
import { FaStar } from 'react-icons/fa';

/**
 * Valoración visual de 3 estrellas, interactiva o readonly.
 *
 * @param {object}   props
 * @param {number}   [props.value=0]       - Valoración actual (1-3) o promedio para modo lectura.
 * @param {Function} [props.onChange]      - Callback `(rating: number) => void`; solo en modo interactivo.
 * @param {boolean}  [props.readonly=false]- Si `true`, no permite selección y usa role="img".
 * @param {number}   [props.size=16]       - Tamaño del ícono de estrella en px.
 */
export default function StarRating({ 
  value = 0, 
  onChange, 
  readonly = false,
  size = 16,
}) {
  /**
   * Invoca `onChange` con la valoración seleccionada.
   * No-op si el componente está en modo readonly.
   *
   * @param {Event}  e      - Evento de clic
   * @param {number} rating - Valor entre 1 y 3.
   */
  const handleClick = (e, rating) => {
    e.preventDefault();
    e.stopPropagation();
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  /**
   * Genera el arreglo de elementos JSX de estrellas según el modo.
   * En readonly devuelve `<FaStar>` estáticos; en interactivo devuelve `<button>`.
   *
   * @returns {JSX.Element[]} Array de 3 elementos representando la escala.
   */
  const getStars = () => {
    const stars = [];
    const displayValue = Math.round(value);
    
    for (let i = 1; i <= 3; i++) {
      const isFilled = i <= displayValue;
      
      if (readonly) {
        stars.push(
          <FaStar
            key={i}
            style={{
              fontSize: `${size}px`,
              color: isFilled ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'color var(--transition-fast)',
            }}
          />
        );
      } else {
        stars.push(
          <button
            key={i}
            onClick={(e) => handleClick(e, i)}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              cursor: 'pointer',
              display: 'flex',
              transition: 'transform var(--transition-fast)',
            }}
            aria-label={`${i} estrella${i > 1 ? 's' : ''}`}
            aria-pressed={value >= i}
          >
            <FaStar
              style={{
                fontSize: `${size}px`,
                color: i <= value ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'color var(--transition-fast)',
              }}
            />
          </button>
        );
      }
    }
    
    return stars;
  };

  return (
    <div
      className="d-inline-flex align-items-center"
      style={{ gap: '4px' }}
      role={readonly ? 'img' : 'radiogroup'}
      aria-label={readonly ? `Valoración: ${value} de 3 estrellas` : 'Selecciona una valoración'}
    >
      {getStars()}
    </div>
  );
}

StarRating.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func,
  readonly: PropTypes.bool,
  size: PropTypes.number,
};