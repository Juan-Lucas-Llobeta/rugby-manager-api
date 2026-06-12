const express = require('express');
const router = express.Router();
const partidoController = require('../controllers/partidoController');
const {
    requirePermission,
    requirePermissionForResource,
    requireTeamMembership,
    requireTeamMembershipForResource
} = require('../middleware/permissions');

router.get('/', requireTeamMembership(), partidoController.getAll);
router.get('/equipo/:idEquipo', requireTeamMembership({ paramName: 'idEquipo' }), partidoController.getByEquipo);
router.get('/:id', requireTeamMembershipForResource('partido'), partidoController.getById);

router.post('/', requirePermission('MANAGE_MATCHES'), partidoController.create);
router.put('/:id', requirePermissionForResource('MANAGE_MATCHES', 'partido'), partidoController.update);
router.patch('/:id/marcador', requirePermissionForResource('LIVE_GAME', 'partido'), partidoController.updateMarcador);
router.patch('/:id/estado', requirePermissionForResource('MANAGE_MATCHES', 'partido'), partidoController.updateEstado);
router.delete('/:id', requirePermissionForResource('MANAGE_MATCHES', 'partido'), partidoController.delete);

module.exports = router;
