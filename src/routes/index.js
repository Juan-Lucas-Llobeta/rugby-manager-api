const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

const authRoutes = require('./authRoutes');
const equipoRoutes = require('./equipoRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const staffRoutes = require('./staffRoutes');
const jugadorRoutes = require('./jugadorRoutes');
const torneoRoutes = require('./torneoRoutes');
const partidoRoutes = require('./partidoRoutes');
const convocatoriaRoutes = require('./convocatoriaRoutes');
const entrenamientoRoutes = require('./entrenamientoRoutes');
const asistenciaRoutes = require('./asistenciaRoutes');
const eventoRoutes = require('./eventoRoutes');
const invitacionRoutes = require('./invitacionRoutes');
const calendarRoutes = require('./calendarRoutes');

// PUBLIC routes (no auth required)
router.use('/auth', authRoutes);

// PROTECTED routes (require valid JWT token)
router.use('/equipos', verifyToken, equipoRoutes);
router.use('/usuarios', verifyToken, usuarioRoutes);
router.use('/staff', verifyToken, staffRoutes);
router.use('/jugadores', verifyToken, jugadorRoutes);
router.use('/torneos', verifyToken, torneoRoutes);
router.use('/partidos', verifyToken, partidoRoutes);
router.use('/convocatorias', verifyToken, convocatoriaRoutes);
router.use('/entrenamientos', verifyToken, entrenamientoRoutes);
router.use('/asistencias', verifyToken, asistenciaRoutes);
router.use('/eventos', verifyToken, eventoRoutes);
router.use('/invitaciones', verifyToken, invitacionRoutes);
router.use('/calendar', verifyToken, calendarRoutes);

module.exports = router;

