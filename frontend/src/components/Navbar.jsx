/* Navbar — Barra de navegación unificada para todas las vistas (PWA Mobile First)
 *
 * Mejoras aplicadas:
 * 1. Corrección del antipatrón de subcomponente dentro de render (LogoCentral extraído).
 * 2. Eliminación de manipulación directa imperativa del DOM en eventos onMouseOver/Blur.
 * 3. Logo central responsivo que no invade ni bloquea botones en pantallas pequeñas.
 * 4. Targets táctiles mínimos accesibles de 44x44px en enlaces e iconos de acción (WCAG 2.5.5).
 * 5. Accesibilidad en notificaciones: aria-label descriptivo y texto oculto
 *    para lectores de pantalla.
 */

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiBell, FiLogOut, FiPlus, FiSettings, FiHome } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const navLinkBase = {
  textDecoration: 'none',
  padding: '0 12px',
  minHeight: '44px',
  borderRadius: 'var(--radius-sm)',
  fontSize: '14px',
  fontWeight: 600,
  transition: 'all var(--transition-fast)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
};

const navIconBtn = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  minWidth: '44px',
  minHeight: '44px',
  width: '44px',
  height: '44px',
  padding: 0,
  borderRadius: 'var(--radius-sm)',
  transition: 'all var(--transition-fast)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

// Logo central sobresaliente declarado fuera del componente para evitar remounts
function LogoCentral() {
  return (
    <Link
      to="/"
      aria-label="Ir a la página principal de Mural Maz Lince"
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src="/icons/icon-512.png"
        alt="Mural Maz Lince"
        style={{
          width: '68px',
          height: '68px',
          maxWidth: '18vw',
          maxHeight: '18vw',
          objectFit: 'contain',
          filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.7))',
          transition: 'transform var(--transition-fast)',
        }}
      />
    </Link>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = location.pathname.startsWith('/dashboard');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al cerrar sesión:', error);
    }
  };

  const renderVisitor = () => (
    <nav
      className="navbar-mml"
      aria-label="Navegación principal"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--spacing-md)',
      }}
    >
      <Link
        to="/login"
        style={{ ...navLinkBase, color: 'var(--text-primary)' }}
      >
        Iniciar sesión
      </Link>

      <LogoCentral />

      <Link
        to="/register"
        style={{ ...navLinkBase, backgroundColor: 'var(--primary)', color: '#FFFFFF' }}
      >
        Registrarse
      </Link>
    </nav>
  );

  const renderStudent = () => (
    <nav
      className="navbar-mml"
      aria-label="Navegación principal"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--spacing-md)',
      }}
    >
      <Link
        to="/register?type=entrepreneur"
        state={{ matricula: user?.matricula }}
        style={{ ...navLinkBase, color: 'var(--text-primary)', border: '1px solid var(--border)' }}
      >
        <FiPlus size={16} style={{ color: 'var(--primary)' }} aria-hidden="true" />
        <span>Emprender</span>
      </Link>

      <LogoCentral />

      <button
        type="button"
        onClick={handleLogout}
        style={{ ...navIconBtn, color: 'var(--text-secondary)' }}
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
      >
        <FiLogOut size={18} aria-hidden="true" />
      </button>
    </nav>
  );

  const renderEntrepreneur = () => (
    <nav
      className="navbar-mml"
      aria-label="Navegación principal"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--spacing-md)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isDashboard ? (
          <Link
            to="/"
            style={{
              ...navLinkBase,
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
            aria-label="Regresar al inicio"
            title="Regresar al inicio"
          >
            <FiHome size={16} aria-hidden="true" />
            <span>Regresar al inicio</span>
          </Link>
        ) : (
          <Link
            to="/dashboard"
            style={{
              ...navLinkBase,
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
            aria-label="Administrar proyectos y anuncios"
            title="Administrar"
          >
            <FiSettings size={16} aria-hidden="true" />
            <span>Administrar</span>
          </Link>
        )}
      </div>

      <LogoCentral />

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Link
          to="/dashboard"
          style={{
            ...navIconBtn,
            position: 'relative',
            color: 'var(--text-primary)',
          }}
          aria-label={unreadCount > 0 ? `Notificaciones: ${unreadCount} nuevas` : 'Notificaciones'}
          title="Notificaciones"
        >
          <FiBell size={20} aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                backgroundColor: 'var(--primary)',
                color: '#FFF',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                boxShadow: '0 0 8px rgba(255,42,45,0.5)',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          style={{ ...navIconBtn, color: 'var(--text-secondary)' }}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <FiLogOut size={18} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );

  const renderAdmin = () => (
    <nav
      className="navbar-mml"
      aria-label="Navegación de administrador"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--spacing-md)',
      }}
    >
      <Link
        to="/admin"
        style={{ ...navLinkBase, color: 'var(--text-primary)', border: '1px solid var(--border)' }}
      >
        <FiSettings size={16} aria-hidden="true" />
        <span>Admin</span>
      </Link>

      <LogoCentral />

      <button
        type="button"
        onClick={handleLogout}
        style={{ ...navIconBtn, color: 'var(--text-secondary)' }}
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
      >
        <FiLogOut size={18} aria-hidden="true" />
      </button>
    </nav>
  );

  if (!isAuthenticated) return renderVisitor();

  switch (user?.role) {
    case 'entrepreneur': return renderEntrepreneur();
    case 'admin': return renderAdmin();
    case 'visitor_registered':
    default: return renderStudent();
  }
}
