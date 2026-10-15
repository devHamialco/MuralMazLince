/* Navbar - Referencia: DDC v3.0 - PWA Mobile First (OLED & Neon Red) */

import { Link, useNavigate } from 'react-router-dom';
import { FiBell, FiLogOut, FiPlus, FiSettings } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const linkBase = {
  textDecoration: 'none',
  padding: '8px 12px',
  borderRadius: 'var(--radius-sm)',
  fontSize: '14px',
  fontWeight: 600,
  transition: 'all var(--transition-fast)',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const buttonBase = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '8px 12px',
  borderRadius: 'var(--radius-sm)',
  fontSize: '14px',
  fontWeight: 600,
  transition: 'all var(--transition-fast)',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Logo central sobresaliente (Estilo unificado para todas las vistas)
  function LogoCentral() {
    return (
      <Link
        to="/"
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          /* El marginTop empuja el logo hacia abajo para que sobresalga del navbar */
          marginTop: '25px',
          zIndex: 200,
        }}
      >
        <img
          src="/icons/icon-512.png"
          alt="Mural Maz Lince"
          style={{
            width: '90px',
            height: '90px',
            objectFit: 'cover',
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))',
          }}
        />
      </Link>
    );
  }

  const renderVisitor = () => (
    <nav className="navbar-mml" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--spacing-md)' }}>
      <Link
        to="/login"
        style={{ ...linkBase, color: 'var(--text-primary)' }}
        onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
      >
        Iniciar sesión
      </Link>

      <LogoCentral />

      <Link
        to="/register"
        style={{ ...linkBase, backgroundColor: 'var(--primary)', color: '#FFFFFF' }}
      >
        Registrarse
      </Link>
    </nav>
  );

  const renderStudent = () => (
    <nav className="navbar-mml" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--spacing-md)' }}>
      <Link
        to="/register?type=entrepreneur"
        state={{ matricula: user?.matricula }}
        style={{ ...linkBase, color: 'var(--text-primary)', border: '1px solid var(--border)' }}
      >
        <FiPlus size={16} style={{ color: 'var(--primary)' }} />
        Emprender
      </Link>

      <LogoCentral />

      <button
        onClick={handleLogout}
        style={{ ...buttonBase, color: 'var(--text-secondary)' }}
        onMouseOver={(e) => e.currentTarget.style.color = 'var(--status-rejected)'}
        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <FiLogOut size={18} />
      </button>
    </nav>
  );

  const renderEntrepreneur = () => (
    <nav className="navbar-mml" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--spacing-md)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link
          to="/dashboard"
          style={{ ...linkBase, color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        >
          <FiSettings size={16} />
          Panel
        </Link>
      </div>

      <LogoCentral />

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Link
          to="/dashboard?create=announcement"
          style={{ ...linkBase, backgroundColor: 'var(--primary)', color: '#FFFFFF', padding: '8px' }}
          title="Crear anuncio"
        >
          <FiPlus size={18} />
        </Link>

        <Link
          to="/dashboard"
          style={{ position: 'relative', color: 'var(--text-primary)', padding: '8px', display: 'flex', alignItems: 'center' }}
        >
          <FiBell size={20} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
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
          onClick={handleLogout}
          style={{ ...buttonBase, color: 'var(--text-secondary)', padding: '8px' }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--status-rejected)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          title="Cerrar sesión"
        >
          <FiLogOut size={18} />
        </button>
      </div>
    </nav>
  );

  const renderAdmin = () => (
    <nav className="navbar-mml" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--spacing-md)' }}>
      <Link
        to="/admin"
        style={{ ...linkBase, color: 'var(--text-primary)', border: '1px solid var(--border)' }}
      >
        <FiSettings size={16} />
        Admin
      </Link>

      <LogoCentral />

      <button
        onClick={handleLogout}
        style={{ ...buttonBase, color: 'var(--text-secondary)' }}
        onMouseOver={(e) => e.currentTarget.style.color = 'var(--status-rejected)'}
        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <FiLogOut size={18} />
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
