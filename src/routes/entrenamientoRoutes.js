const express = require('express');
const router = express.Router();
const entrenamientoController = require('../controllers/entrenamientoController');
const {
    requirePermission,
    requirePermissionForResource,
    requireTeamMembership,
    requireTeamMembershipForResource
} = require('../middleware/permissions');

router.get('/', requireTeamMembership(), entrenamientoController.getAll);
router.get('/equipo/:idEquipo', requireTeamMembership({ paramName: 'idEquipo' }), entrenamientoController.getByEquipo);
router.get('/:id', requireTeamMembershipForResource('entrenamiento'), entrenamientoController.getById);

router.post('/', requirePermission('MANAGE_TRAININGS'), entrenamientoController.create);
router.put('/:id', requirePermissionForResource('MANAGE_TRAININGS', 'entrenamiento'), entrenamientoController.update);
router.patch('/:id/estado', requirePermissionForResource('MANAGE_TRAININGS', 'entrenamiento'), entrenamientoController.updateEstado);
router.delete('/:id', requirePermissionForResource('MANAGE_TRAININGS', 'entrenamiento'), entrenamientoController.delete);

module.exports = router;
