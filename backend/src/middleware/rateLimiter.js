const rateLimit = require("express-rate-limit");

/** Límite para rutas de autenticación: 10 intentos por ventana de 15 minutos (SAD). */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
};
