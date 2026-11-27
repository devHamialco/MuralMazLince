const { Router } = require('express');
const projectController = require('../controllers/projectController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

// Detalle de proyecto y autor (solo usuarios autenticados)
router.get('/public/:id', requireAuth, projectController.getPublicProject);

router.use(requireAuth, requireRole('entrepreneur', 'admin'));

router.get('/', projectController.listProjects);
router.get('/metrics', projectController.getAggregatedMetrics);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProject);
router.patch('/:id', projectController.updateProject);
router.patch('/:id/status', projectController.updateProjectStatus);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
