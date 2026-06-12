const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipoController');
const { requirePermission, requireTeamMembership } = require('../middleware/permissions');

/**
 * @swagger
 * /api/equipos/{id}:
 *   get:
 *     summary: Obtener equipo por ID (solo si eres staff del equipo)
 *     tags: [Equipos]
 */
router.get('/:id', requireTeamMembership({ paramName: 'id' }), equipoController.getById);

/**
 * @swagger
 * /api/equipos/{id}:
 *   put:
 *     summary: Actualizar equipo
 *     tags: [Equipos]
 */
router.put('/:id', requirePermission('TEAM_SETTINGS'), equipoController.update);

/**
 * @swagger
 * /api/equipos/{id}:
 *   delete:
 *     summary: Eliminar equipo
 *     tags: [Equipos]
 */
router.delete('/:id', requirePermission('TEAM_SETTINGS'), equipoController.delete);

/**
 * @swagger
 * /api/equipos/{id}/stats:
 *   get:
 *     summary: Obtener estadísticas del equipo
 *     tags: [Equipos]
 */
router.get('/:id/stats', requireTeamMembership({ paramName: 'id' }), equipoController.getStats);

module.exports = router;
