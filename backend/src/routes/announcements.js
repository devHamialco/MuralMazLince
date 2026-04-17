const { Router } = require('express');
const feedController = require('../controllers/feedController');
const announcementController = require('../controllers/announcementController');
const interactionController = require('../controllers/interactionController');
const reportController = require('../controllers/reportController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

// Público
router.get('/', feedController.getFeed);
router.get('/:id', feedController.getAnnouncementDetail);

// CRUD anuncios (emprendedor)
router.post('/', requireAuth, requireRole('entrepreneur'), announcementController.createAnnouncement);
router.patch('/:id', requireAuth, requireRole('entrepreneur'), announcementController.updateAnnouncement);
router.delete('/:id', requireAuth, requireRole('entrepreneur'), announcementController.deleteAnnouncement);

// Interacciones (sub-recursos de anuncio)
router.post('/:id/like', requireAuth, requireRole('visitor_registered', 'entrepreneur'), interactionController.toggleLike);
router.post('/:id/rating', requireAuth, requireRole('visitor_registered', 'entrepreneur'), interactionController.upsertRating);
router.delete('/:id/rating', requireAuth, requireRole('visitor_registered', 'entrepreneur'), interactionController.deleteRating);

// Reportes
router.post('/:id/report', requireAuth, requireRole('visitor_registered', 'entrepreneur'), reportController.createReport);

module.exports = router;
