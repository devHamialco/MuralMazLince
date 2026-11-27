import React from 'react';
import PropTypes from 'prop-types';

/**
 * EmptyState — Componente visual para colecciones vacías o estados de error.
 * Presenta una ilustración icónica moderna con halo y llamadas a la acción directas.
 *
 * @param {object} props
 * @param {React.ElementType} props.icon - Componente icono (ej. FiFolder).
 * @param {string} props.title - Título principal.
 * @param {string} props.subtitle - Mensaje explicativo o guía para el usuario.
 * @param {string} [props.actionLabel] - Texto del botón de acción.
 * @param {Function} [props.onAction] - Handler al presionar el botón.
 * @param {'empty'|'error'} [props.variant] - Variante semántica.
 */
export default function EmptyState({
  icon: Icon,
  title,
  subtitle,
  actionLabel = undefined,
  onAction = undefined,
  variant = 'empty',
}) {
  const isError = variant === 'error';

  return (
    <div
      className={`empty-state-box ${isError ? 'error' : ''}`}
      role={isError ? 'alert' : undefined}
    >
      <div className="empty-state-icon-circle">
        <Icon aria-hidden="true" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-subtitle">{subtitle}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          className="btn-cta btn-cta-primary btn-cta-sm"
          onClick={onAction}
          style={{ minHeight: '44px', padding: '0 24px' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  variant: PropTypes.oneOf(['empty', 'error']),
};
