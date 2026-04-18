/* Reclamo de Matrícula - WF-3.2.5 (wireframes) */
/* Referencia: DDC, wireframes-spec.md */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function ClaimMatricula() {
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [matricula, setMatricula] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Validación simple, se valida en el manejo de submit

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    // Básica validación
    const m = matricula?.trim();
    const w = whatsapp?.trim().replace(/[^\d+]/g, '');
    if (!m || m.length !== 8 || m[0] !== '2' || !/^[0-9]{8}$/.test(m) || !/^[+]?\d{10}$/.test(w)) {
      setError('Matrícula o WhatsApp inválidos');
      return;
    }
    setLoading(true);
    try {
      await api.claimMatricula({ matricula: m, whatsapp_number: w });
      setSubmitted(true);
      showToast('Tu reclamo fue registrado. Un administrador se comunicará contigo vía WhatsApp.', 'success');
      // Redirige al feed después del reclamo
      navigate('/');
    } catch (err) {
      if (err?.status === 409) {
        showToast('Ya existe un reclamo para esta matrícula', 'warning');
      } else {
        showToast('Error al registrar el reclamo', 'error');
      }
      setError(err?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-md)', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', textDecoration: 'none', marginBottom: '12px' }}>
        Volver a Reclamo
      </Link>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Reclamo de Matrícula</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>La matrícula ya está en uso. Completa los datos para iniciar el reclamo.</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Matricula</label>
          <input
            type="tel"
            placeholder="20240001"
            maxLength={8}
            value={matricula}
            onChange={(e) => setMatricula(e.target.value.replace(/\D/g, '').slice(0, 8))}
            style={{ width: '100%', height: '52px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0 12px', color: 'var(--text-primary)' }}
          />
        </div>
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>WhatsApp</label>
          <input
            type="tel"
            placeholder="+52 1234567890"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))}
            style={{ width: '100%', height: '52px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0 12px', color: 'var(--text-primary)' }}
          />
        </div>
        {error && (
          <p style={{ color: 'var(--status-rejected)', fontSize: '12px' }}>{error}</p>
        )}
        <button type="submit" disabled={loading} className="btn-cta btn-cta-primary" style={{ width: '100%', height: '52px' }}>
          {loading ? 'Registrando reclamo...' : 'Enviar reclamo'}
        </button>
      </form>
      {submitted && (
        <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>Tu reclamo ha sido registrado exitosamente.</p>
      )}
    </div>
  );
}
