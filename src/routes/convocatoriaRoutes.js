const express = require('express');
const router = express.Router();
const convocatoriaController = require('../controllers/convocatoriaController');
const {
    requirePermissionForResource,
    requireTeamMembershipForResource
} = require('../middleware/permissions');

router.get('/partido/:idPartido', requireTeamMembershipForResource('partido'), convocatoriaController.getByPartido);
router.get('/jugador/:idJugador', requireTeamMembershipForResource('jugador'), convocatoriaController.getByJugador);
router.get('/:id', requireTeamMembershipForResource('convocatoria'), convocatoriaController.getById);

router.post('/', requirePermissionForResource('MANAGE_MATCHES', 'partido'), convocatoriaController.create);
router.put('/:id', requirePermissionForResource('MANAGE_MATCHES', 'convocatoria'), convocatoriaController.update);
router.delete('/:id', requirePermissionForResource('MANAGE_MATCHES', 'convocatoria'), convocatoriaController.delete);
router.delete('/partido/:idPartido', requirePermissionForResource('MANAGE_MATCHES', 'partido'), convocatoriaController.deleteByPartido);
router.put('/partido/:idPartido/minutos', requirePermissionForResource('MANAGE_MATCHES', 'partido'), convocatoriaController.updateMinutosByPartido);

module.exports = router;
