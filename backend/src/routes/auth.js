const { Router } = require('express');
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { requireAuth } = require('../middleware/auth');

const router = Router();

// Ruta pública — sin rate limit (es solo una página estática de información legal)
router.get('/privacy', authController.getPrivacy);

// Perfil del emprendedor (solo usuarios autenticados)
router.get('/profile/:id', requireAuth, authController.getEntrepreneurProfile);

// Obtener datos del usuario logueado
router.get('/me', requireAuth, authController.getMe);

// Actualizar perfil del emprendedor logueado
router.patch('/profile', requireAuth, authController.updateProfile);

// Rutas sensibles — aplica rate limit individualmente (10 intentos / 15 min)
router.post('/register/student', authLimiter, authController.registerStudent);
router.post('/register/entrepreneur', authLimiter, authController.registerEntrepreneur);
router.post('/login', authLimiter, authController.login);
// Verificación proactiva de tipo de usuario (no autentica); sensible al mismo rate limit que /login
router.post('/login/check', authLimiter, authController.checkLogin);
router.post('/logout', authController.logout);
router.post('/claim-matricula', authController.claimMatricula);

module.exports = router;
