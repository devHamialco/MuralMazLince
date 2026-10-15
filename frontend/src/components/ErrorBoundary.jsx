/**
 * @fileoverview ErrorBoundary - Boundary global de recuperación de errores
 *
 * Captura errores de React en el árbol de componentes y muestra
 * una UI de fallback en lugar de dejar la app en blanco.
 *
 * Referencia: SRS RNF-10 - Accesibilidad básica
 */

import React from 'react';
import PropTypes from 'prop-types';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
    this.setState({ error });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      const errorMessage = error?.toString() || 'Unknown error';

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-base)',
            color: 'var(--text-primary)',
            padding: 'var(--spacing-xl)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-2xl)',
              maxWidth: '400px',
            }}
          >
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--status-rejected)',
                marginBottom: 'var(--spacing-md)',
              }}
            >
              Algo salió mal
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--spacing-lg)',
              }}
            >
              Encontramos un problema inesperado. Por favor intentá de nuevo.
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="btn-cta btn-cta-primary"
              style={{
                width: '100%',
                height: '48px',
              }}
            >
              Intentar de nuevo
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details
                style={{
                  marginTop: 'var(--spacing-lg)',
                  textAlign: 'left',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                }}
              >
                <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                  Detalles del error
                </summary>
                <pre
                  style={{
                    overflow: 'auto',
                    padding: 'var(--spacing-sm)',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {errorMessage}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};
