/* Login - wireframes-spec.md WF-3.2.4 */
/* Referencia: DDC, wireframes-spec.md */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const isValidMatricula = (matricula) => {
  if (!matricula || matricula.length !== 8) return false;
  if (!/^\d{8}$/.test(matricula)) return false;
  return matricula[0] === '2';
};

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [matricula, setMatricula] = useState('');
  const [matriculaValid, setMatriculaValid] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleMatriculaChange = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 8);
    setMatricula(cleaned);
    if (cleaned.length === 8) {
      setMatriculaValid(isValidMatricula(cleaned));
    } else {
      setMatriculaValid(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(matricula, password || null);
      
      showToast(`Bienvenido, ${user.display_name || user.matricula}`, 'success');
      
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from);
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'entrepreneur') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.status === 401) {
        setError('Contraseña incorrecta.');
      } else if (err.status === 404) {
        setError('Matrícula no encontrada.');
      } else if (err.data?.is_suspended) {
        setError('Tu cuenta está suspendida. Contacta al administrador.');
      } else {
        setError(err.message || 'Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', padding: 'var(--spacing-md)' }}>
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-primary)',
          fontSize: '14px',
          padding: 'var(--spacing-sm)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginBottom: 'var(--spacing-md)',
        }}
      >
        <FiArrowLeft size={20} />
        Volver
      </button>

      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginTop: 'var(--spacing-lg)' }}>
        Iniciar sesión
      </h1>
      <p className="body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xl)' }}>
        Ingresa tu matrícula para continuar
      </p>

      <form onSubmit={handleSubmit}>
        {/* Campo matrícula */}
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Número de matrícula
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="tel"
              value={matricula}
              onChange={(e) => handleMatriculaChange(e.target.value)}
              placeholder="20240001"
              maxLength={8}
              style={{
                width: '100%',
                height: '52px',
                backgroundColor: 'var(--bg-card)',
                border: `1px solid ${matriculaValid === false ? 'var(--status-rejected)' : matriculaValid === true ? 'var(--status-active)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '0 44px 0 16px',
                fontSize: '16px',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-25px)', display: 'flex' }}>
              {matriculaValid === true && <FiCheck size={20} style={{ color: 'var(--status-active)' }} />}
              {matriculaValid === false && <FiX size={20} style={{ color: 'var(--status-rejected)' }} />}
            </div>
          </div>
        </div>

        {/* Campo contraseña - wireframes-spec:503-509 */}
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Contraseña <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Si eres solo estudiante, deja la contraseña en blanco"
              style={{
                width: '100%',
                height: '52px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '0 44px 0 16px',
                fontSize: '16px',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {showPassword ? '😵' : '👁️'}
            </button>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Si eres solo estudiante, deja la contraseña en blanco.
          </p>
        </div>

        {/* Mensajes de error - wireframes-spec:514-522 */}
        {error && (
          <div 
            style={{ 
              backgroundColor: 'rgba(229,62,62,0.1)', 
              borderLeft: '2px solid var(--status-rejected)',
              padding: '12px',
              marginBottom: 'var(--spacing-md)',
            }}
          >
            <p style={{ fontSize: '14px', color: 'var(--status-rejected)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiX size={16} />
              {error}
            </p>
          </div>
        )}

        {/* Botón CTA */}
        <button
          type="submit"
          disabled={loading || !matriculaValid}
          className="btn-cta btn-cta-primary"
          style={{ width: '100%', height: '52px' }}
        >
          {loading ? 'Iniciando sesi��n...' : 'Iniciar sesión'}
        </button>
      </form>

      {/* Link registro */}
      <p style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)', fontSize: '14px', color: 'var(--text-muted)' }}>
        ¿No tienes cuenta?{' '}
        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Registrarse
        </Link>
      </p>
    </div>
  );
}