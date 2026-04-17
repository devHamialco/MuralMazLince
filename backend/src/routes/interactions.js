const { Router } = require('express');
const interactionController = require('../controllers/interactionController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

router.use(requireAuth, requireRole('visitor_registered', 'entrepreneur'));
router.post('/announcements/:id/like', interactionController.toggleLike);
router.post('/announcements/:id/rating', interactionController.upsertRating);
router.delete('/announcements/:id/rating', interactionController.deleteRating);

module.exports = router;
