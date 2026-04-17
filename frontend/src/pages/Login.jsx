import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [matricula, setMatricula] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Determinar tipo de login basado en si hay contraseña
  const isEntrepreneurLogin = password.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Intentar login
      const user = await login(matricula, password || null);
      
      showToast(`Bienvenido, ${user.display_name || user.matricula}`, 'success');
      
      // Redirigir según rol
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
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="login-page d-flex align-items-center justify-content-center"
      style={{ 
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)',
        padding: 'var(--spacing-md)',
      }}
    >
      <div 
        className="card"
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--bg-elevated)',
          borderRadius: 'var(--border-radius-lg)',
        }}
      >
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <Link 
              to="/"
              style={{ 
                color: 'var(--primary)', 
                fontWeight: 700, 
                fontSize: '1.5rem',
                textDecoration: 'none',
              }}
            >
              Mural Maz Lince
            </Link>
            <p className="text-muted mt-2">Iniciar sesión</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label 
                htmlFor="matricula" 
                className="form-label"
                style={{ color: 'var(--text-secondary)' }}
              >
                Matrícula
              </label>
              <input
                type="text"
                id="matricula"
                className="form-control"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="20240001"
                required
                maxLength={8}
                pattern="[0-9]{8}"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--bg-hover)',
                  color: 'var(--text-primary)',
                }}
              />
              <div className="form-text" style={{ color: 'var(--text-muted)' }}>
                8 dígitos, primer dígito = 2
              </div>
            </div>

            <div className="mb-3">
              <label 
                htmlFor="password" 
                className="form-label"
                style={{ color: 'var(--text-secondary)' }}
              >
                Contraseña <span className="text-muted">(opcional)</span>
              </label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={password ? '••••••••' : 'Sin contraseña → usuario registrado'}
                minLength={8}
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--bg-hover)',
                  color: 'var(--text-primary)',
                }}
              />
              <div className="form-text" style={{ color: 'var(--text-muted)' }}>
                Sin contraseña: inicio como usuario registrado<br />
                Con contraseña: inicio como emprendedor o admin
              </div>
            </div>

            {error && (
              <div 
                className="alert alert-danger" 
                role="alert"
                style={{ 
                  backgroundColor: 'rgba(244, 67, 54, 0.1)', 
                  border: '1px solid var(--error)',
                  color: 'var(--error)',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn w-100"
              disabled={loading}
              style={{
                backgroundColor: 'var(--primary)',
                color: 'white',
                fontWeight: 600,
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Iniciando...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="text-muted mb-2">¿No tienes cuenta?</p>
            <Link 
              to="/register" 
              style={{ color: 'var(--primary-light)' }}
            >
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}