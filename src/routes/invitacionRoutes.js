const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const invitacionController = require('../controllers/invitacionController');
const { requirePermission, requirePermissionForResource } = require('../middleware/permissions');

const validateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 20 : 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiados intentos de validación. Intente nuevamente en unos minutos.' }
});

/**
 * Invitation Routes
 */

/**
 * @swagger
 * /api/invitaciones:
 *   post:
 *     summary: Create invitation code
 *     tags: [Invitations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_equipo, rol, id_creador]
 *             properties:
 *               id_equipo:
 *                 type: string
 *               rol:
 *                 type: string
 *                 enum: [ENTRENADOR, MANAGER]
 *               id_creador:
 *                 type: string
 *                 description: Staff ID of the HEAD_COACH creating the invitation
 *     responses:
 *       201:
 *         description: Invitation created
 *       403:
 *         description: Only HEAD_COACH can create invitations
 */
router.post('/', requirePermission('INVITE_COACHES'), invitacionController.create);

/**
 * @swagger
 * /api/invitaciones/equipo/{id}:
 *   get:
 *     summary: Get all invitations for a team
 *     tags: [Invitations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of invitations
 */
router.get('/equipo/:id', requirePermission('INVITE_COACHES'), invitacionController.getByEquipo);

/**
 * @swagger
 * /api/invitaciones/validate/{codigo}:
 *   get:
 *     summary: Validate invitation code without redeeming
 *     tags: [Invitations]
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Validation result with team info
 */
router.get('/validate/:codigo', validateLimiter, invitacionController.validate);

/**
 * @swagger
 * /api/invitaciones/{id}:
 *   delete:
 *     summary: Delete/revoke invitation
 *     tags: [Invitations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation deleted
 */
router.delete('/:id', requirePermissionForResource('INVITE_COACHES', 'invitacion'), invitacionController.delete);

module.exports = router;
