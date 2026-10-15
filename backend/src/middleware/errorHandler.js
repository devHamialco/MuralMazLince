/**
 * Middleware centralizado de errores (debe registrarse al final de app.js).
 * @type {import('express').ErrorRequestHandler}
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  res.status(status).json({
    error: message,
  });
}

module.exports = {
  errorHandler,
};
