const { Router } = require('express');
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');

const router = Router();

// Ruta pública — sin rate limit (es solo una página estática de información legal)
router.get('/privacy', authController.getPrivacy);

// Rutas sensibles — aplica rate limit individualmente (10 intentos / 15 min)
router.post('/register/student', authLimiter, authController.registerStudent);
router.post('/register/entrepreneur', authLimiter, authController.registerEntrepreneur);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);
router.post('/claim-matricula', authController.claimMatricula);

module.exports = router;
