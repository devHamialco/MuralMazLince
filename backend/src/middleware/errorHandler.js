/**
 * Middleware centralizado de errores (debe registrarse al final de app.js).
 * @type {import('express').ErrorRequestHandler}
 */
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Error interno del servidor";
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({
    error: message,
  });
}

module.exports = {
  errorHandler,
};
