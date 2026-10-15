import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children, allowedRoles = null }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [showDenied, setShowDenied] = useState(false);

  // When role doesn't match, show brief denial message before redirecting
  useEffect(() => {
    if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      setShowDenied(true);
      const timer = setTimeout(() => setShowDenied(false), 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [loading, user, allowedRoles]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (showDenied) {
      return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100" style={{ padding: 'var(--spacing-xl)' }}>
          <h2 style={{ color: 'var(--status-rejected)', marginBottom: 'var(--spacing-sm)' }}>Acceso denegado</h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
            No tienes permisos para acceder a esta sección.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Redirigiendo al inicio...</p>
        </div>
      );
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};
