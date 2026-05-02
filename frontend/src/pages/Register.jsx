/* Register - wireframes-spec.md WF-3.2.1, WF-3.2.2, WF-3.2.3 */
/* Referencia: DDC, wireframes-spec.md */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCheck, FiX, FiLock, FiArrowLeft } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

// Checksum de matrícula - wireframes-spec:357-361
const isValidMatricula = (matricula) => {
  if (!matricula || matricula.length !== 8) return false;
  if (!/^\d{8}$/.test(matricula)) return false;
  return matricula[0] === '2';
};

// Validador de contraseña - wireframes-spec:414-422
const getPasswordStrength = (password) => {
  if (password.length < 1) return { level: 0, label: '', color: 'var(--border)' };
  if (password.length < 8) return { level: 1, label: 'Débil', color: 'var(--status-rejected)' };
  
  const hasNumber = /\d/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const isStrong = password.length >= 8 && hasNumber && hasUpper;
  
  if (isStrong) return { level: 3, label: 'Fuerte', color: 'var(--status-active)' };
  return { level: 2, label: 'Aceptable', color: 'var(--status-pending)' };
};

// Validador de WhatsApp - wireframes-spec:447
const isValidWhatsApp = (phone) => {
  return phone.replace(/\D/g, '').length === 10;
};

export default function Register() {
  const { registerStudent, registerEntrepreneur, login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  
  const [step, setStep] = useState('welcome'); // welcome, student, entrepreneur
  const [matricula, setMatricula] = useState('');
  const [matriculaValid, setMatriculaValid] = useState(null);
  
  // Campos emprendedor
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [whatsapp, setWhatsapp] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [displayNameError, setDisplayNameError] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const passwordStrength = getPasswordStrength(password);

  const handleMatriculaChange = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 8);
    setMatricula(cleaned);
    if (cleaned.length === 8) {
      setMatriculaValid(isValidMatricula(cleaned));
    } else {
      setMatriculaValid(null);
    }
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
  };

  const handleWhatsappChange = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 10);
    setWhatsapp(cleaned);
  };

  const handleDisplayNameBlur = () => {
    // Aquí se aplicaría el filtro bad-words
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

  const handleEntrepreneurSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const isValid = isValidMatricula(matricula) && 
                  password.length >= 8 && 
                  isValidWhatsApp(whatsapp) && 
                  displayName.length >= 2 &&
                  privacyAccepted;

    if (!isValid) {
      setError('Por favor completa todos los campos correctamente');
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

  // Pantalla de bienvenida - wireframes-spec: WF-3.2.1
  if (step === 'welcome') {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(24, 90, 196, 0.15) 0%, transparent 60%)',
          backgroundColor: 'var(--bg-base)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--spacing-lg)',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <img src="/icons/icon-512.png" alt="Mural Maz Lince" style={{ width: '150px', height: '150px', objectFit: 'cover', marginBottom: '100px' }} />
        </Link>

        {/* Botón explorar sin cuenta */}
        <Link
          to="/"
          className="btn-cta btn-cta-outline"
          style={{ width: '100%', height: '48px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          Explorar sin cuenta
        </Link>

        {/* Separador */}
        <div className="divider" style={{ width: '100%', margin: 'var(--spacing-md) 0' }}>
          o regístrate
        </div>

        {/* Botón estudiante */}
        <Link
          to="/register?type=student"
          onClick={() => setStep('student')}
          className="btn-cta btn-cta-secondary"
          style={{ width: '100%', height: '48px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          Registrarme como Estudiante
        </Link>

        {/* Botón emprendedor */}
        <Link
          to="/register?type=entrepreneur"
          onClick={() => setStep('entrepreneur')}
          className="btn-cta btn-cta-primary"
          style={{ width: '100%', height: '48px', marginTop: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          Registrarme como Emprendedor
        </Link>

        {/* Link login */}
        <p style={{ marginTop: 'var(--spacing-lg)', fontSize: '14px', color: 'var(--text-muted)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Iniciar sesión
          </Link>
        </p>
      </div>
    );
  }

  // Registro estudiante - wireframes-spec: WF-3.2.2
  if (step === 'student') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', padding: 'var(--spacing-md)' }}>
        {/* Header */}
        <button
          onClick={() => setStep('welcome')}
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
          Crear cuenta de estudiante
        </h1>
        <p className="body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xl)' }}>
          Solo necesitas tu matrícula
        </p>

        <form onSubmit={handleStudentSubmit}>
          {/* Campo matrícula */}
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Número de matrícula
            </label>
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
            {/* Indicador de validación */}
            <div
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-25px)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {matriculaValid === true && <FiCheck size={20} style={{ color: 'var(--status-active)' }} />}
              {matriculaValid === false && <FiX size={20} style={{ color: 'var(--status-rejected)' }} />}
            </div>
            {/* Texto de ayuda */}
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              8 dígitos · Debe comenzar con 2
            </p>
          </div>

          {error && (
            <p style={{ fontSize: '12px', color: 'var(--status-rejected)', marginBottom: 'var(--spacing-md)' }}>
              {error}
            </p>
          )}

          {/* Botón CTA */}
          <button
            type="submit"
            disabled={loading || !matriculaValid}
            className="btn-cta btn-cta-primary"
            style={{ width: '100%', height: '52px' }}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    );
  }

  // Registro emprendedor - wireframes-spec: WF-3.2.3
  if (step === 'entrepreneur') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', padding: 'var(--spacing-md)', overflow: 'auto' }}>
        {/* Header */}
        <button
          onClick={() => setStep('welcome')}
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

        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Crear cuenta de emprendedor
        </h1>
        <p className="body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
          Publica tus proyectos en el mural universitario
        </p>

        <form onSubmit={handleEntrepreneurSubmit}>
          {/* Campo matrícula */}
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Número de matrícula
            </label>
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
            <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-25px)' }}>
              {matriculaValid === true && <FiCheck size={20} style={{ color: 'var(--status-active)' }} />}
              {matriculaValid === false && <FiX size={20} style={{ color: 'var(--status-rejected)' }} />}
            </div>
          </div>

          {/* Campo contraseña */}
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Mínimo 8 caracteres"
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
            {/* Barra de fortaleza */}
            <div style={{ marginTop: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${passwordStrength.level * 33.33}%`, height: '100%', backgroundColor: passwordStrength.color, transition: 'all 150ms' }} />
                </div>
                <span style={{ fontSize: '12px', color: passwordStrength.color }}>{passwordStrength.label}</span>
              </div>
            </div>
          </div>

          {/* Campo display_name */}
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              ¿Cómo quieres que te conozcan?
            </label>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Este nombre aparecerá en el mural junto a tus anuncios.
            </p>
            <input
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (displayNameError) setDisplayNameError(false);
              }}
              onBlur={handleDisplayNameBlur}
              placeholder="ej: Mariana G., Tech Lince"
              maxLength={80}
              style={{
                width: '100%',
                height: '52px',
                backgroundColor: 'var(--bg-card)',
                border: `1px solid ${displayNameError ? 'var(--status-rejected)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '0 44px 0 16px',
                fontSize: '16px',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <span style={{ position: 'absolute', right: '16px', bottom: '18px', fontSize: '12px', color: displayName.length > 70 ? 'var(--accent)' : 'var(--text-muted)' }}>
              {displayName.length}/80
            </span>
            {displayNameError && (
              <p style={{ fontSize: '12px', color: 'var(--status-rejected)', marginTop: '6px' }}>
                Por favor elige un nombre apropiado
              </p>
            )}
          </div>

          {/* Campo WhatsApp */}
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Número de WhatsApp
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => handleWhatsappChange(e.target.value)}
              placeholder="+52 1 669 123 4567"
              style={{
                width: '100%',
                height: '52px',
                backgroundColor: 'var(--bg-card)',
                border: `1px solid ${isValidWhatsApp(whatsapp) && whatsapp ? 'var(--status-active)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '0 44px 0 16px',
                fontSize: '16px',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-25px)' }}>
              {isValidWhatsApp(whatsapp) && whatsapp && <FiCheck size={20} style={{ color: 'var(--status-active)' }} />}
            </div>
            {/* Nota de privacidad */}
            <div
              style={{
                marginTop: 'var(--spacing-sm)',
                backgroundColor: 'var(--bg-card)',
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
                Tu número solo se usará para generar un enlace de contacto. No se publicará como texto plano.
              </p>
            </div>
          </div>

          {/* Checkbox privacidad */}
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: privacyAccepted ? 'var(--primary)' : 'var(--bg-card)',
                  border: '2px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background-color 150ms',
                }}
                onClick={() => setPrivacyAccepted(!privacyAccepted)}
              >
                {privacyAccepted && <FiCheck size={14} style={{ color: 'var(--text-primary)' }} />}
              </div>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                He leído y acepto el{' '}
                <a href="/privacy" target="_blank" style={{ color: 'var(--secondary)', textDecoration: 'underline' }}>
                  Aviso de Privacidad
                </a>
              </span>
            </label>
          </div>

          {error && (
            <p style={{ fontSize: '12px', color: 'var(--status-rejected)', marginBottom: 'var(--spacing-md)' }}>
              {error}
            </p>
          )}

          {/* Botón CTA */}
          <button
            type="submit"
            disabled={loading || !matriculaValid || password.length < 8 || !isValidWhatsApp(whatsapp) || displayName.length < 2 || !privacyAccepted}
            className="btn-cta btn-cta-primary"
            style={{ width: '100%', height: '52px' }}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta de emprendedor'}
          </button>
        </form>
      </div>
    );
  }

  return null;
}