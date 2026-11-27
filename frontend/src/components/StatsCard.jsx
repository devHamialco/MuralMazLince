import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * StatsCard — Tarjeta de métrica con animación numérica fluida y accesible.
 *
 * Mejoras aplicadas:
 * 1. Respeto a prefers-reduced-motion: si el usuario tiene activada la reducción
 *    de movimiento en su sistema operativo, el valor se asigna de inmediato sin setInterval.
 * 2. Formato numérico consistente con locale es-MX.
 * 3. Accesibilidad para lectores de pantalla con aria-label integrado.
 */
export default function StatsCard({
  label,
  value,
  icon,
  color = 'var(--primary)',
}) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const numericValue = typeof value === 'number' ? value : parseFloat(value);

    // Si no es un número válido (ej. "—" o vacío), mostrar el valor tal cual sin animar.
    if (!Number.isFinite(numericValue)) {
      setDisplayValue(value ?? '—');
      return undefined;
    }

    const isFloat = !Number.isInteger(numericValue);
    const target = numericValue;

    // Respetar preferencia de reducción de movimiento
    const prefersReducedMotion = typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(isFloat ? target.toFixed(1) : Math.round(target).toLocaleString('es-MX'));
      return undefined;
    }

    const duration = 800; // ms
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const timer = setInterval(() => {
      frame += 1;
      const progress = frame / totalFrames;
      // Easing out cubic
      const eased = 1 - (1 - progress) ** 3;
      const current = target * eased;

      if (frame >= totalFrames) {
        clearInterval(timer);
        setDisplayValue(isFloat ? target.toFixed(1) : Math.round(target).toLocaleString('es-MX'));
      } else {
        setDisplayValue(isFloat ? current.toFixed(1) : Math.round(current).toLocaleString('es-MX'));
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div
      className="stats-card-box"
      aria-label={`${label}: ${displayValue}`}
      role="group"
    >
      <div className="stats-card-icon" style={{ color }} aria-hidden="true">
        {icon}
      </div>
      <div className="stats-card-content">
        <span className="stats-card-label">{label}</span>
        <span className="stats-card-value">{displayValue}</span>
      </div>
    </div>
  );
}

StatsCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.string,
};
