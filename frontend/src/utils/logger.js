/**
 * @fileoverview Logger con gate de desarrollo
 *
 * Controla qué mensajes de console se muestran en producción.
 * En desarrollo (DEV) muestra todo. En producción solo errores.
 *
 * Uso:
 *   import logger from './utils/logger';
 *   logger.info('Mensaje de debug'); // Solo en dev
 *   logger.error('Error crítico');   // Siempre
 */

const isDev = import.meta && import.meta.env && import.meta.env.DEV;

const logger = {
  /**
   * Logs de debug - solo en desarrollo
   */
  debug: (...args) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.debug(...args);
    }
  },

  /**
   * Logs informativos - solo en desarrollo
   */
  info: (...args) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.info(...args);
    }
  },

  /**
   * Logs de warn - siempre visible pero solo en dev
   */
  warn: (...args) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn(...args);
    }
  },

  /**
   * Errors - siempre visibles (producción y dev)
   */
  error: (...args) => {
    // eslint-disable-next-line no-console
    console.error(...args);
  },

  /**
   * Logs de API - para debugging de llamadas al servidor
   */
  api: (method, endpoint, ...args) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.debug(`[API] ${method} ${endpoint}`, ...args);
    }
  },
};

export default logger;

// Exportar también las funciones directamente para uso más simple
export const { debug, info, warn, error, api } = logger;
