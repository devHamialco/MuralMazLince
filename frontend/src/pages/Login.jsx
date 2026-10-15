import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiCheck, FiX, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Navbar from '../components/Navbar';

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
    setRequirePassword(false);
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(matricula, password || null);
      // Notificación de éxito
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
        setError(null);
      } else if (err.status === 401) {
        setError('Contraseña incorrecta.');
      } else if (err.status === 404) {
        setError('Aún no tienes una cuenta. Por favor regístrate.');
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
    <div className="app-container bg-base">
      <Navbar />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>

        <div className="card-mml" style={{ width: '100%', maxWidth: '420px', padding: 'var(--spacing-2xl) var(--spacing-xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
            <h1 style={{ fontSize: '34px', color: 'var(--tertiary)', marginBottom: 'var(--spacing-xs)', letterSpacing: '-0.03em' }}>
              Iniciar Sesión
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Ingresa para descubrir todo de tu emprendimiento favorito y estar al tanto de las últimas novedades
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Matrícula
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  value={matricula}
                  onChange={(e) => handleMatriculaChange(e.target.value)}
                  maxLength={8}
                  disabled={requirePassword}
                  className="form-control"
                  style={{
                    width: '100%',
                    paddingRight: '44px',
                    color: 'var(--text-primary)',
                    backgroundColor: requirePassword ? 'var(--bg-surface)' : 'var(--bg-surface)',
                    borderColor: matriculaValid === false ? 'var(--status-rejected)' : matriculaValid === true ? 'var(--status-active)' : 'var(--border)',
                    boxShadow: matriculaValid === true
                      ? '0 0 12px rgba(16, 185, 129, 0.2)'
                      : matriculaValid === false
                        ? '0 0 12px rgba(239, 68, 68, 0.2)'
                        : 'none',
                  }}
                />
                <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
                  {matriculaValid === true && <FiCheck size={18} style={{ color: 'var(--status-active)' }} />}
                  {matriculaValid === false && <FiX size={18} style={{ color: 'var(--status-rejected)' }} />}
                </div>
              </div>
            </div>

            {requirePassword && (
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    autoFocus
                    className="form-control"
                    style={{ width: '100%', paddingRight: '44px', color: 'var(--text-primary)' }}
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
                      height: '32px',
                    }}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                marginBottom: 'var(--spacing-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
              >
                <FiAlertCircle size={18} style={{ color: 'var(--status-rejected)', flexShrink: 0 }} />
                <p style={{ fontSize: '14px', color: 'var(--status-rejected)', margin: 0, fontWeight: 500 }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !matriculaValid || (requirePassword && password.length === 0)}
              className="btn-cta btn-cta-primary"
              style={{ width: '100%', marginTop: 'var(--spacing-sm)' }}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <span>Procesando...</span>
                </div>
              ) : 'Continuar'}
            </button>
          </form>

          <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--border)', margin: 'var(--spacing-xl) 0' }} />

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
            ¿No tienes cuenta?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, transition: 'color var(--transition-fast)' }}>
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
