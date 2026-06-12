const express = require('express');
const router = express.Router();
const jugadorController = require('../controllers/jugadorController');
const {
    requirePermission,
    requirePermissionForResource,
    requireTeamMembership,
    requireTeamMembershipForResource
} = require('../middleware/permissions');

router.get('/', requireTeamMembership(), jugadorController.getAll);
router.get('/equipo/:idEquipo', requireTeamMembership({ paramName: 'idEquipo' }), jugadorController.getByEquipo);
router.get('/stats/equipo/:idEquipo', requireTeamMembership({ paramName: 'idEquipo' }), jugadorController.getStatsByEquipo);
router.get('/:id/stats', requireTeamMembershipForResource('jugador'), jugadorController.getStats);
router.get('/:id', requireTeamMembershipForResource('jugador'), jugadorController.getById);

router.post('/', requirePermission('MANAGE_ROSTER'), jugadorController.create);
router.put('/:id', requirePermissionForResource('MANAGE_ROSTER', 'jugador'), jugadorController.update);
router.patch('/:id/estado', requirePermissionForResource('MANAGE_ROSTER', 'jugador'), jugadorController.updateEstado);
router.delete('/:id', requirePermissionForResource('MANAGE_ROSTER', 'jugador'), jugadorController.delete);

module.exports = router;
