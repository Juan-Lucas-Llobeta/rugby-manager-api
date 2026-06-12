const express = require('express');
const router = express.Router();
const asistenciaController = require('../controllers/asistenciaController');
const {
    requirePermissionForResource,
    requireTeamMembershipForResource
} = require('../middleware/permissions');

router.get('/entrenamiento/:idEntrenamiento', requireTeamMembershipForResource('entrenamiento'), asistenciaController.getByEntrenamiento);
router.get('/jugador/:idJugador', requireTeamMembershipForResource('jugador'), asistenciaController.getByJugador);
router.get('/jugador/:idJugador/stats', requireTeamMembershipForResource('jugador'), asistenciaController.getStatsByJugador);
router.get('/:id', requireTeamMembershipForResource('asistencia'), asistenciaController.getById);

router.post('/', requirePermissionForResource('TAKE_ATTENDANCE', 'entrenamiento'), asistenciaController.create);
router.post('/entrenamiento/:idEntrenamiento/bulk', requirePermissionForResource('TAKE_ATTENDANCE', 'entrenamiento'), asistenciaController.bulkCreate);
router.put('/:id', requirePermissionForResource('TAKE_ATTENDANCE', 'asistencia'), asistenciaController.update);
router.delete('/:id', requirePermissionForResource('TAKE_ATTENDANCE', 'asistencia'), asistenciaController.delete);

module.exports = router;
