const { Router } = require('express');
const adminController = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

router.use(requireAuth, requireRole('admin'));
router.get('/moderation-queue', adminController.getModerationQueue);
router.patch('/announcements/:id/approve', adminController.approveAnnouncement);
router.post('/announcements/:id/reject', adminController.rejectAnnouncement);
router.post('/users/:id/suspend', adminController.suspendUser);
router.get('/claim-tickets', adminController.getClaimTickets);
router.patch('/claim-tickets/:id/resolve', adminController.resolveClaimTicket);
router.get('/qr', adminController.getQr);

module.exports = router;
