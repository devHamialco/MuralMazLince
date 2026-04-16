const { Router } = require('express');
const authRoutes = require('./auth');
const announcementRoutes = require('./announcements');
const projectRoutes = require('./projects');
const interactionRoutes = require('./interactions');
const notificationRoutes = require('./notifications');
const adminRoutes = require('./admin');

const router = Router();

router.use('/auth', authRoutes);
router.use('/announcements', announcementRoutes);
router.use('/projects', projectRoutes);
router.use('/interactions', interactionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
