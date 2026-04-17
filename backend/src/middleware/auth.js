const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación JWT.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'No se encontró token de autenticación (HttpOnly Cookie)' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
}

/**
 * Middleware de autorización por roles.
 * @param {...string} roles Permite uno o múltiples roles
 */
function requireRole(...roles) {
  return function roleMiddleware(req, res, next) {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permisos suficientes para esta acción' });
    }
    next();
  };
}

module.exports = {
  requireAuth,
  requireRole,
};
