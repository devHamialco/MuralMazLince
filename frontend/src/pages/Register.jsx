import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

// Algoritmo de checksum para validación de matrícula
const isValidMatricula = (matricula) => {
  if (!matricula || matricula.length !== 8) return false;
  if (!/^\d{8}$/.test(matricula)) return false;
  return matricula[0] === '2';
};

export default function Register() {
  const { registerStudent, registerEntrepreneur, login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: tipo, 2: estudiante, 3: emprendedor
  const [userType, setUserType] = useState(null); // 'student' | 'entrepreneur'
  
  // Campos comunes
  const [matricula, setMatricula] = useState('');
  const [matriculaValid, setMatriculaValid] = useState(null);
  
  // Campos emprendedor
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validar matrícula en tiempo real
  const handleMatriculaChange = (value) => {
    setMatricula(value);
    if (value.length === 8) {
      setMatriculaValid(isValidMatricula(value));
    } else {
      setMatriculaValid(null);
    }
  };

  // Seleccionar tipo de usuario
  const handleSelectType = (type) => {
    setUserType(type);
    setStep(type === 'student' ? 2 : 3);
  };

  // Registro como estudiante
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerStudent(matricula);
      showToast('Registro exitoso. Ahora puedes iniciar sesión.', 'success');
      navigate('/login');
    } catch (err) {
      console.error('Student registration error:', err);
      if (err.status === 409) {
        setError('Esta matrícula ya está registrada. ¿Quieres reclamar tu matrícula?');
      } else {
        setError(err.message || 'Error al registrarte');
      }
    } finally {
      setLoading(false);
    }
  };

  // Registro como emprendedor
  const handleEntrepreneurSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!isValidMatricula(matricula)) {
      setError('Matrícula inválida');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (!whatsapp.match(/^\d{10}$/)) {
      setError('WhatsApp debe ser un número de 10 dígitos');
      return;
    }
    if (!displayName.trim()) {
      setError('El nombre visible es obligatorio');
      return;
    }
    if (!privacyAccepted) {
      setError('Debes aceptar el aviso de privacidad');
      return;
    }

    setLoading(true);

    try {
      await registerEntrepreneur({
        matricula,
        password,
        whatsapp_number: whatsapp,
        display_name: displayName.trim(),
        privacy_accepted: true,
      });
      
      // Login automático después del registro
      await login(matricula, password);
      showToast(`Bienvenido, ${displayName}`, 'success');
      navigate('/dashboard');
    } catch (err) {
      console.error('Entrepreneur registration error:', err);
      if (err.status === 409) {
        setError('Esta matrícula ya está registrada. ¿Quieres reclamar tu matrícula?');
      } else if (err.data?.error?.includes('bad-words')) {
        setError('El nombre visible contiene palabras inapropiadas');
      } else {
        setError(err.message || 'Error al registrarte');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="register-page d-flex align-items-center justify-content-center"
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
          maxWidth: '450px',
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
            <p className="text-muted mt-2">
              {step === 1 && 'Crear cuenta'}
              {step === 2 && 'Registro como estudiante'}
              {step === 3 && 'Registro como emprendedor'}
            </p>
          </div>

          {/* Paso 1: Seleccionar tipo */}
          {step === 1 && (
            <div className="type-selection">
              <p className="text-center text-secondary mb-4">
                ¿Qué tipo de cuenta deseas crear?
              </p>
              
              <div className="d-grid gap-3">
                <button
                  className="btn p-4"
                  onClick={() => handleSelectType('student')}
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--bg-hover)',
                    textAlign: 'left',
                  }}
                >
                  <h5 className="mb-1" style={{ color: 'var(--text-primary)' }}>
                    Estudiante
                  </h5>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
                    Solo matrícula. Puedes filtrar y valorar anuncios.
                  </p>
                </button>
                
                <button
                  className="btn p-4"
                  onClick={() => handleSelectType('entrepreneur')}
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--bg-hover)',
                    textAlign: 'left',
                  }}
                >
                  <h5 className="mb-1" style={{ color: 'var(--primary-light)' }}>
                    Emprendedor
                  </h5>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
                    Matrícula + contraseña + WhatsApp. Publica y gestiona tus proyectos.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Paso 2: Registro estudiante */}
          {step === 2 && (
            <form onSubmit={handleStudentSubmit}>
              <div className="mb-3">
                <label 
                  htmlFor="matricula" 
                  className="form-label"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Matrícula estudiantil
                </label>
                <input
                  type="text"
                  id="matricula"
                  className={`form-control ${matriculaValid === true ? 'is-valid' : ''} ${matriculaValid === false ? 'is-invalid' : ''}`}
                  value={matricula}
                  onChange={(e) => handleMatriculaChange(e.target.value)}
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
                  {matriculaValid === true && <span className="text-success">✓ Formato válido</span>}
                  {matriculaValid === false && <span className="text-danger">✗ Formato inválido (8 dígitos, inicia con 2)</span>}
                  {matriculaValid === null && '8 dígitos, primer dígito = 2'}
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

              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className="btn"
                  disabled={loading || !matriculaValid}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                >
                  {loading ? 'Registrando...' : 'Registrarse'}
                </button>
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={() => {
                    setStep(1);
                    setMatricula('');
                    setMatriculaValid(null);
                    setError(null);
                  }}
                >
                  ← Volver
                </button>
              </div>
            </form>
          )}

          {/* Paso 3: Registro emprendedor */}
          {step === 3 && (
            <form onSubmit={handleEntrepreneurSubmit}>
              <div className="mb-3">
                <label 
                  htmlFor="matricula" 
                  className="form-label"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Matrícula estudiantil
                </label>
                <input
                  type="text"
                  id="matricula"
                  className={`form-control ${matriculaValid === true ? 'is-valid' : ''} ${matriculaValid === false ? 'is-invalid' : ''}`}
                  value={matricula}
                  onChange={(e) => handleMatriculaChange(e.target.value)}
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
              </div>

              <div className="mb-3">
                <label 
                  htmlFor="password" 
                  className="form-label"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--bg-hover)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div className="mb-3">
                <label 
                  htmlFor="confirmPassword" 
                  className="form-label"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  required
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--bg-hover)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div className="mb-3">
                <label 
                  htmlFor="whatsapp" 
                  className="form-label"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Número de WhatsApp
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  className="form-control"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="6671234567"
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--bg-hover)',
                    color: 'var(--text-primary)',
                  }}
                />
                <div className="form-text" style={{ color: 'var(--text-muted)' }}>
                  10 dígitos sin espacios ni país
                </div>
              </div>

              <div className="mb-3">
                <label 
                  htmlFor="displayName" 
                  className="form-label"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Nombre visible <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="displayName"
                  className="form-control"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre o nombre de tu negocio"
                  required
                  maxLength={80}
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--bg-hover)',
                    color: 'var(--text-primary)',
                  }}
                />
                <div className="form-text" style={{ color: 'var(--text-muted)' }}>
                  Este nombre será visible en el feed
                </div>
              </div>

              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  id="privacyAccepted"
                  className="form-check-input"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  required
                />
                <label 
                  className="form-check-label" 
                  htmlFor="privacyAccepted"
                  style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}
                >
                  Acepto el <a href="/privacy" target="_blank" style={{ color: 'var(--primary-light)' }}>aviso de privacidad</a>
                </label>
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

              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className="btn"
                  disabled={loading || !matriculaValid || !privacyAccepted}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                >
                  {loading ? 'Registrando...' : 'Crear cuenta'}
                </button>
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={() => {
                    setStep(1);
                    setMatricula('');
                    setMatriculaValid(null);
                    setError(null);
                  }}
                >
                  ← Volver
                </button>
              </div>
            </form>
          )}

          <div className="text-center mt-4">
            <p className="text-muted mb-0">¿Ya tienes cuenta?</p>
            <Link 
              to="/login" 
              style={{ color: 'var(--primary-light)' }}
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}