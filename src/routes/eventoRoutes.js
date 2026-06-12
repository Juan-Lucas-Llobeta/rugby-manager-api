const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');
const {
    requirePermissionForResource,
    requireTeamMembershipForResource
} = require('../middleware/permissions');

router.get('/partido/:idPartido', requireTeamMembershipForResource('partido'), eventoController.getByPartido);
router.get('/puntaje/partido/:idPartido', requireTeamMembershipForResource('partido'), eventoController.getPuntajeByPartido);
router.get('/puntaje/jugador/:idJugador/stats', requireTeamMembershipForResource('jugador'), eventoController.getPuntajeStatsByJugador);
router.get('/formacion/partido/:idPartido', requireTeamMembershipForResource('partido'), eventoController.getFormacionByPartido);
router.get('/formacion/partido/:idPartido/stats', requireTeamMembershipForResource('partido'), eventoController.getFormacionStatsByPartido);
router.get('/:id', requireTeamMembershipForResource('evento'), eventoController.getById);

router.post('/puntaje', requirePermissionForResource('LIVE_GAME', 'partido'), eventoController.createPuntaje);
router.put('/puntaje/:id', requirePermissionForResource('LIVE_GAME', 'evento_puntaje'), eventoController.updatePuntaje);
router.post('/formacion', requirePermissionForResource('LIVE_GAME', 'partido'), eventoController.createFormacion);
router.put('/formacion/:id', requirePermissionForResource('LIVE_GAME', 'evento_formacion'), eventoController.updateFormacion);
router.delete('/:id', requirePermissionForResource('LIVE_GAME', 'evento'), eventoController.delete);

module.exports = router;
