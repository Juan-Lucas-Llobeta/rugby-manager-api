const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const { requireTeamMembership } = require('../middleware/permissions');

/**
 * @swagger
 * /api/calendar/equipo/{idEquipo}:
 *   get:
 *     summary: Get calendar events (matches + trainings) for a team
 *     tags: [Calendar]
 *     parameters:
 *       - in: path
 *         name: idEquipo
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD), defaults to first of current month
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD), defaults to last of current month
 *     responses:
 *       200:
 *         description: Calendar events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 desde:
 *                   type: string
 *                   format: date
 *                 hasta:
 *                   type: string
 *                   format: date
 *                 total:
 *                   type: integer
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [PARTIDO, ENTRENAMIENTO]
 *                       title:
 *                         type: string
 *                       start:
 *                         type: string
 *                         format: date-time
 *                       end:
 *                         type: string
 *                         format: date-time
 *                       color:
 *                         type: string
 *                       data:
 *                         type: object
 */
router.get('/equipo/:idEquipo', requireTeamMembership({ paramName: 'idEquipo' }), calendarController.getByEquipo);

module.exports = router;
