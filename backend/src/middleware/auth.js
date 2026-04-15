/**
 * Middleware de autenticación JWT (estructura base).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requireAuth(req, res, next) {
  next();
}

/**
 * @param {...string} roles
 */
function requireRole(...roles) {
  return function roleMiddleware(req, res, next) {
    next();
  };
}

module.exports = {
  requireAuth,
  requireRole,
};
