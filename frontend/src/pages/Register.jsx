/* Register - wireframes-spec.md WF-3.2.1, WF-3.2.2, WF-3.2.3 */
/* Referencia: DDC, wireframes-spec.md */

import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiX,
  FiLock,
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiInstagram,
  FiMessageCircle,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Navbar from '../components/Navbar';

// Checksum de matrícula - wireframes-spec:357-361
const isValidMatricula = (matricula) => {
  if (!matricula || matricula.length !== 8) return false;
  if (!/^\d{8}$/.test(matricula)) return false;
  return matricula[0] === '2';
};

const isValidWhatsApp = (phone) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10;
};

const getMatriculaValidationStyles = (valid) => {
  if (valid === true) {
    return {
      borderColor: 'var(--status-active)',
      boxShadow: '0 0 12px rgba(16, 185, 129, 0.2)',
    };
  }
  if (valid === false) {
    return {
      borderColor: 'var(--status-rejected)',
      boxShadow: '0 0 12px rgba(239, 68, 68, 0.2)',
    };
  }
  return { borderColor: 'var(--border)', boxShadow: 'none' };
};

export default function Register() {
  const { registerStudent, registerEntrepreneur } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const initialMatricula = String(location.state?.matricula || '')
    .replace(/\D/g, '')
    .slice(0, 8);
  const [step, setStep] = useState(() => (
    new URLSearchParams(location.search).get('type') === 'entrepreneur' ? 'entrepreneur' : 'bienvenido'
  ));
  const [matricula, setMatricula] = useState(initialMatricula);
  const [matriculaValid, setMatriculaValid] = useState(
    initialMatricula.length === 8 ? isValidMatricula(initialMatricula) : null,
  );

  useEffect(() => {
    if (new URLSearchParams(location.search).get('type') !== 'entrepreneur') return;

    const prefilledMatricula = String(location.state?.matricula || '')
      .replace(/\D/g, '')
      .slice(0, 8);
    setStep('entrepreneur');
    setMatricula(prefilledMatricula);
    setMatriculaValid(
      prefilledMatricula.length === 8 ? isValidMatricula(prefilledMatricula) : null,
    );
  }, [location]);

  // Campos emprendedor
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bioShort, setBioShort] = useState('');
  const [contactType, setContactType] = useState('whatsapp'); // 'whatsapp' | 'instagram'
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [displayNameError, setDisplayNameError] = useState(false);

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

  const handleWhatsappChange = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 10);
    setWhatsapp(cleaned);
  };

  const handleDisplayNameBlur = () => {
    if (displayName.length > 0 && displayName.length < 2) {
      setDisplayNameError(true);
    } else {
      setDisplayNameError(false);
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerStudent(matricula);
      showToast('Cuenta creada. Inicia sesión.', 'success');
      navigate('/login');
    } catch (err) {
      console.error('Student registration error:', err);
      if (err.status === 409) {
        setError('Esta matrícula ya está registrada.');
      } else {
        setError(err.message || 'Error al registrarte');
      }
    } finally {
      setLoading(false);
    }
  };

  const getEntrepreneurValidationError = () => {
    if (!isValidMatricula(matricula)) {
      return 'Ingresa una matrícula válida de 8 dígitos que comience con 2.';
    }
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (displayName.trim().length < 2) {
      return 'El nombre público debe tener al menos 2 caracteres.';
    }
    if (contactType === 'whatsapp' && !isValidWhatsApp(whatsapp)) {
      return 'Ingresa un número de WhatsApp válido de 10 dígitos.';
    }
    if (contactType === 'instagram' && !instagram.trim()) {
      return 'Ingresa tu nombre de usuario de Instagram.';
    }
    if (!privacyAccepted) {
      return 'Debes aceptar el Aviso de Privacidad para continuar.';
    }
    return null;
  };

  const handleEntrepreneurSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validationError = getEntrepreneurValidationError();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await registerEntrepreneur({
        matricula,
        password,
        display_name: displayName.trim(),
        bio_short: bioShort.trim() || undefined,
        whatsapp_number: contactType === 'whatsapp' ? whatsapp : undefined,
        instagram_handle: contactType === 'instagram' ? instagram.trim() : undefined,
        privacy_accepted: true,
      });

      showToast('Cuenta creada', 'success');
      navigate('/dashboard');
    } catch (err) {
      console.error('Entrepreneur registration error:', err);
      if (err.status === 409) {
        setError('Esta matrícula ya está registrada.');
      } else if (err.data?.error?.includes('bad-words')) {
        setDisplayNameError(true);
        setError('Por favor elige un nombre apropiado');
      } else {
        setError(err.message || 'Error al registrarte');
      }
    } finally {
      setLoading(false);
    }
  };

  if (step === 'bienvenido') {
    return (
      <div className="app-container bg-base">
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
          <div className="card-mml" style={{ width: '100%', maxWidth: '420px', padding: 'var(--spacing-2xl) var(--spacing-xl)', textAlign: 'center' }}>
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h1 style={{ fontSize: '34px', color: 'var(--tertiary)', marginBottom: 'var(--spacing-xs)', letterSpacing: '-0.03em' }}>
                Bienvenido
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Únete a la comunidad y comienza a descubrir o publicar emprendimientos
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <Link
                to="/"
                className="btn-cta btn-cta"
                style={{ width: '100%', height: '52px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                Explorar sin cuenta
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', margin: 'var(--spacing-sm) 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>o regístrate</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
              </div>

              <Link
                to="/register?type=student"
                onClick={() => setStep('student')}
                className="btn-cta btn-cta-secondary"
                style={{ width: '100%', height: '52px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                Como Estudiante
              </Link>

              <Link
                to="/register?type=entrepreneur"
                onClick={() => setStep('entrepreneur')}
                className="btn-cta btn-cta-primary"
                style={{ width: '100%', height: '52px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                Como Emprendedor
              </Link>
            </div>

            <p style={{ marginTop: 'var(--spacing-xl)', fontSize: '14px', color: 'var(--text-muted)', margin: 'var(--spacing-xl) 0 0 0' }}>
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'student') {
    return (
      <div className="app-container bg-base">
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
          <div className="card-mml" style={{ width: '100%', maxWidth: '420px', padding: 'var(--spacing-2xl) var(--spacing-xl)' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
              <button
                type="button"
                onClick={() => setStep('bienvenido')}
                style={{
                  position: 'absolute',
                  top: 'var(--spacing-md)',
                  left: 'var(--spacing-md)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <FiArrowLeft size={20} /> Volver
              </button>
              <h1 style={{ fontSize: '34px', color: 'var(--tertiary)', marginBottom: 'var(--spacing-md)', letterSpacing: '-0.03em' }}>
                Estudiante
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Obten todos los detalles de los proyectos y apoya a la
                comunidad emprendedora de la universidad.
              </p>
            </div>

            <form onSubmit={handleStudentSubmit}>
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label htmlFor="entrepreneur-matricula" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Matrícula
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="entrepreneur-matricula"
                    type="tel"
                    value={matricula}
                    onChange={(e) => handleMatriculaChange(e.target.value)}
                    maxLength={8}
                    className="form-control"
                    style={{
                      width: '100%',
                      paddingRight: '44px',
                      color: 'var(--text-primary)',
                      ...getMatriculaValidationStyles(matriculaValid),
                    }}
                  />
                  <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
                    {matriculaValid === false && <FiX size={18} style={{ color: 'var(--status-rejected)' }} />}
                  </div>
                </div>
              </div>

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
                disabled={loading || !matriculaValid}
                className="btn-cta btn-cta-primary"
                style={{ width: '100%', height: '52px' }}
              >
                {loading ? 'Procesando...' : 'Crear cuenta'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'entrepreneur') {
    return (
      <div className="app-container bg-base">
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
          <div className="card-mml" style={{ width: '100%', maxWidth: '420px', padding: 'var(--spacing-2xl) var(--spacing-xl)' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
              <button
                type="button"
                onClick={() => setStep('bienvenido')}
                style={{
                  position: 'absolute',
                  top: 'var(--spacing-md)',
                  left: 'var(--spacing-md)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <FiArrowLeft size={20} /> Volver
              </button>
              <h1 style={{ fontSize: '34px', color: 'var(--tertiary)', marginBottom: 'var(--spacing-xs)', letterSpacing: '-0.03em' }}>
                Cuenta Emprendedor
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Publica tus proyectos y llega a toda la comunidad
              </p>
            </div>

            <form onSubmit={handleEntrepreneurSubmit}>
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label htmlFor="student-matricula" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Matrícula
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="student-matricula"
                    type="tel"
                    value={matricula}
                    onChange={(e) => handleMatriculaChange(e.target.value)}
                    maxLength={8}
                    className="form-control"
                    style={{
                      width: '100%',
                      paddingRight: '44px',
                      color: 'var(--text-primary)',
                      ...getMatriculaValidationStyles(matriculaValid),
                    }}
                  />
                  <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
                    {matriculaValid === false && <FiX size={18} style={{ color: 'var(--status-rejected)' }} />}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label htmlFor="entrepreneur-password" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="entrepreneur-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    aria-describedby="entrepreneur-password-help"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="form-control"
                    style={{ width: '100%', paddingRight: '44px', color: 'var(--text-primary)' }}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={showPassword}
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
                <p id="entrepreneur-password-help" style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', marginBottom: 0 }}>
                  Mínimo 8 caracteres.
                </p>
              </div>

              <div
                style={{
                  marginBottom: 'var(--spacing-lg)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(234, 179, 8, 0.1)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  lineHeight: '1.4',
                }}
              >
                <FiAlertCircle size={16} style={{ color: 'var(--status-pending)', flexShrink: 0 }} />
                <span>Podrás editar esta información más adelante</span>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label htmlFor="entrepreneur-display-name" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Nombre Público
                </label>
                <input
                  id="entrepreneur-display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (displayNameError) setDisplayNameError(false);
                  }}
                  onBlur={handleDisplayNameBlur}
                  maxLength={80}
                  placeholder="¿Cómo quieres que te conozcan?"
                  className="form-control"
                  style={{
                    width: '100%',
                    color: 'var(--text-primary)',
                    borderColor: displayNameError ? 'var(--status-rejected)' : 'var(--border)',
                  }}
                />
                {displayNameError && (
                  <p style={{ fontSize: '12px', color: 'var(--status-rejected)', marginTop: '6px', marginBottom: 0 }}>
                    Por favor elige un nombre apropiado
                  </p>
                )}
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label htmlFor="entrepreneur-bio" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Cuéntanos sobre tu emprendimiento
                </label>
                <textarea
                  id="entrepreneur-bio"
                  value={bioShort}
                  onChange={(e) => setBioShort(e.target.value.slice(0, 200))}
                  maxLength={200}
                  rows={3}
                  placeholder="¿De qué trata tu negocio o qué ofreces?"
                  className="form-control"
                  style={{
                    width: '100%',
                    color: 'var(--text-primary)',
                    resize: 'vertical',
                  }}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px', marginBottom: 0 }}>
                  {bioShort.length}/200
                </p>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Elige tu medio de contacto
                </span>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setContactType('whatsapp')}
                    className={`btn-cta btn-cta-sm ${contactType === 'whatsapp' ? 'btn-cta-primary' : 'btn-cta-outline'}`}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <FiMessageCircle size={16} /> WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactType('instagram')}
                    className={`btn-cta btn-cta-sm ${contactType === 'instagram' ? 'btn-cta-primary' : 'btn-cta-outline'}`}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <FiInstagram size={16} /> Instagram
                  </button>
                </div>

                {contactType === 'whatsapp' ? (
                  <div>
                    <label htmlFor="entrepreneur-whatsapp" style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Número de celular
                    </label>
                    <input
                      id="entrepreneur-whatsapp"
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => handleWhatsappChange(e.target.value)}
                      placeholder="10 dígitos"
                      className="form-control"
                      style={{
                        width: '100%',
                        color: 'var(--text-primary)',
                        borderColor: isValidWhatsApp(whatsapp) && whatsapp ? 'var(--status-active)' : 'var(--border)',
                        boxShadow: isValidWhatsApp(whatsapp) && whatsapp
                          ? '0 0 12px rgba(16, 185, 129, 0.2)'
                          : 'none',
                      }}
                    />
                    <div
                      style={{
                        marginTop: 'var(--spacing-sm)',
                        backgroundColor: 'rgba(46, 91, 255, 0.1)',
                        borderLeft: '2px solid var(--secondary)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <FiLock size={14} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                        Tu número solo se usará para contactarte sobre tus proyectos.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="entrepreneur-instagram" style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Nombre de usuario de Instagram
                    </label>
                    <input
                      id="entrepreneur-instagram"
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@usuario"
                      className="form-control"
                      style={{
                        width: '100%',
                        color: 'var(--text-primary)',
                        borderColor: instagram.trim() ? 'var(--status-active)' : 'var(--border)',
                      }}
                    />
                    <div
                      style={{
                        marginTop: 'var(--spacing-sm)',
                        backgroundColor: 'rgba(46, 91, 255, 0.1)',
                        borderLeft: '2px solid var(--secondary)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <FiInstagram size={14} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                        Los interesados podrán contactarte directamente en tu cuenta de Instagram.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="d-flex align-items-start gap-2" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <input
                  id="privacy-accepted"
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(event) => setPrivacyAccepted(event.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', marginTop: '2px' }}
                />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  <label htmlFor="privacy-accepted">He leído y acepto el</label>{' '}
                  <a href="/privacy" target="_blank" style={{ color: 'var(--secondary)', textDecoration: 'underline' }}>
                    Aviso de Privacidad
                  </a>
                </span>
              </div>

              {error && (
                <div
                  role="alert"
                  style={{
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
                disabled={loading}
                className="btn-cta btn-cta-primary"
                style={{ width: '100%', height: '52px' }}
              >
                {loading ? 'Procesando...' : 'Crear cuenta de emprendedor'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
