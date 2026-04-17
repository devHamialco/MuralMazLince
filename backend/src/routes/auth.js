const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

router.get('/privacy', authController.getPrivacy);
router.post('/register/student', authController.registerStudent);
router.post('/register/entrepreneur', authController.registerEntrepreneur);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/claim-matricula', authController.claimMatricula);

module.exports = router;
