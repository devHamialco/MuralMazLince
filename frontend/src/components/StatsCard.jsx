import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * StatsCard — Component for displaying aggregated metrics with animated counters.
 * Part of the Dashboard Harmony Redesign.
 *
 * @param {object} props
 * @param {string} props.label  - Text label for the metric (e.g., "Total Likes")
 * @param {number} props.value  - Target value to animate towards.
 * @param {React.ReactNode} props.icon - Icon component to display.
 * @param {string} [props.color='var(--primary)'] - Accent color for the icon and glow.
 */
export default function StatsCard({ label, value, icon, color = 'var(--primary)' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const start = 0;
    const end = parseInt(value, 10) || 0;
    if (start === end) return;

    // Calculate duration based on value to keep animation snappy
    const duration = 1000; // 1 second total
    const frameRate = 1000 / 60; // ~60fps
    const increment = end / (duration / frameRate);

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev >= end) {
          clearInterval(timer);
          return end;
        }
        const next = prev + increment;
        return next >= end ? end : next;
      });
    }, frameRate);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div
      className="stats-card card-mml"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem',
        boxShadow: 'var(--shadow-button)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        transition: 'var(--transition-fast)',
        minWidth: '200px',
        flex: 1,
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 42, 45, 0.1)', // Soft red background for icon
          color,
          padding: 'var(--spacing-sm)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{
          color: 'var(--text-secondary)',
          fontSize: '14px',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '2px',
        }}
        >
          {label}
        </div>
        <div style={{
          color: 'var(--text-primary)',
          fontSize: '24px',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
        }}
        >
          {Math.floor(count).toLocaleString()}
        </div>
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
