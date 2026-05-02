/* Login - wireframes-spec.md WF-3.2.4 */
/* Referencia: DDC, wireframes-spec.md */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
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
  const [requirePassword, setRequirePassword] = useState(false);
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
    // Si cambia la matrícula, reiniciamos el paso de contraseña
    setRequirePassword(false);
    setPassword('');
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
      if (err.data?.requirePassword) {
        setRequirePassword(true);
        setError(null); // Borrar error previo si lo hay para limpiar UX
      } else if (err.status === 401) {
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
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      {/* Navbar estandarizado */}
      <nav
        style={{
          backgroundColor: 'var(--bg-surface)',
          height: '56px',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--z-sticky)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 var(--spacing-md)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <button 
          onClick={() => navigate(-1)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            textDecoration: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <img src="/icons/icon-512.png" alt="Mural Maz Lince" style={{ width: '32px', height: '32px', objectFit: 'cover' }} />
          <FiArrowLeft size={20} />
          <span>Volver al Mural</span>
        </button>
      </nav>

      <div style={{ maxWidth: '400px', margin: '0 auto', padding: 'var(--spacing-lg) var(--spacing-md)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
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
                maxLength={8}
                disabled={requirePassword}
                style={{
                  width: '100%',
                  height: '52px',
                  backgroundColor: 'var(--bg-card)',
                  border: `1px solid ${matriculaValid === false ? 'var(--status-rejected)' : matriculaValid === true ? 'var(--status-active)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '0 44px 0 16px',
                  fontSize: '16px',
                  color: requirePassword ? 'var(--text-muted)' : 'var(--text-primary)',
                  outline: 'none',
                }}
              />
              <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-25px)', display: 'flex' }}>
                {matriculaValid === true && <FiCheck size={20} style={{ color: 'var(--status-active)' }} />}
                {matriculaValid === false && <FiX size={20} style={{ color: 'var(--status-rejected)' }} />}
              </div>
            </div>
          </div>

          {/* Campo contraseña (Se muestra solo si se requiere) */}
          {requirePassword && (
            <div style={{ marginBottom: 'var(--spacing-md)', animation: 'slideDown 200ms ease-out' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  autoFocus
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px'
                  }}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>
          )}

          {/* Mensajes de error */}
          {error && (
            <div 
              style={{ 
                backgroundColor: 'rgba(229,62,62,0.1)', 
                borderLeft: '2px solid var(--status-rejected)',
                padding: '12px',
                marginBottom: 'var(--spacing-md)',
                animation: 'fadeIn 200ms ease-out'
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
            disabled={loading || !matriculaValid || (requirePassword && password.length === 0)}
            className="btn-cta btn-cta-primary"
            style={{ width: '100%', height: '52px', fontSize: '18px' }}
          >
            {loading ? 'Iniciando sesion...' : 'Continuar'}
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
    </div>
  );
}