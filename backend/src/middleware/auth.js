const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación JWT.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requireAuth(req, res, next) {
  const { token } = req.cookies;
  if (!token) {
    res.status(401).json({ error: 'No se encontró token de autenticación (HttpOnly Cookie)' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token expirado' });
      return;
    }
    res.status(401).json({ error: 'Token inválido' });
  }
}

/**
 * Middleware de autorización por roles.
 * @param {...string} roles Permite uno o múltiples roles
 */
function requireRole(...roles) {
  return function roleMiddleware(req, res, next) {
    if (!req.user || !req.user.role) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'No tienes permisos suficientes para esta acción' });
      return;
    }
    next();
  };
}

module.exports = {
  requireAuth,
  requireRole,
};
