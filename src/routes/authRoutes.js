const express = require('express');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const router = express.Router();
const Equipo = require('../models/Equipo');
const Staff = require('../models/Staff');
const Usuario = require('../models/Usuario');
const { generateToken, verifyToken } = require('../middleware/auth');

// Strict rate limiter for auth endpoints (brute-force prevention)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 5 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiados intentos de autenticación. Intente nuevamente en 15 minutos.' },
    skipSuccessfulRequests: true // Don't count successful logins
});

/**
 * Auth routes
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correo, password]
 *             properties:
 *               correo:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authLimiter, async (req, res, next) => {
    try {
        const { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({ error: 'Correo y contraseña requeridos' });
        }

        const usuario = await Usuario.findByEmail(correo);

        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Compare password with stored bcrypt hash
        const passwordValid = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordValid) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generate JWT token
        const token = generateToken(usuario);

        res.json({
            user: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo: usuario.correo
            },
            token
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, apellido, correo, password]
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               correo:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid data or email already exists
 */
router.post('/register', authLimiter, async (req, res, next) => {
    try {
        const { nombre, apellido, correo, password } = req.body;

        // Validation
        if (!correo || !correo.includes('@')) {
            return res.status(400).json({ error: 'Correo inválido' });
        }
        if (!apellido || apellido.trim() === '') {
            return res.status(400).json({ error: 'El apellido es requerido' });
        }
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre es requerido' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // Check if email already exists
        const existingUser = await Usuario.findByEmail(correo);
        if (existingUser) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // Create user (password will be hashed in the service)
        const usuarioService = require('../services/usuarioService');
        const usuario = await usuarioService.create({ correo, apellido, nombre, password });

        // Generate JWT token
        const token = generateToken(usuario);

        res.status(201).json({
            user: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo: usuario.correo
            },
            token
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/setup-team:
 *   post:
 *     summary: Create a new team and assign user as HEAD_COACH
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_usuario
 *               - equipo
 *             properties:
 *               id_usuario:
 *                 type: string
 *                 description: UUID of the user creating the team
 *               equipo:
 *                 type: string
 *                 description: Team name
 *               club:
 *                 type: string
 *                 description: Club name (optional)
 *               temporada_id:
 *                 type: integer
 *                 description: Season ID (optional)
 *     responses:
 *       201:
 *         description: Team created and user assigned as HEAD_COACH
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/setup-team', verifyToken, async (req, res, next) => {
    try {
        // Use userId from JWT token (not from body) to prevent impersonation
        const userId = req.userId;
        const { equipo, club, temporada_id } = req.body;

        if (!equipo || equipo.trim() === '') {
            return res.status(400).json({ error: 'El nombre del equipo es requerido' });
        }

        // Create the team
        const newEquipo = await Equipo.create({
            id_equipo: uuidv4(),
            equipo: equipo.trim(),
            club: club?.trim() || null,
            temporada_id: temporada_id || null
        });

        // Create staff record with user as HEAD_COACH and principal
        const staff = await Staff.create({
            id_staff: uuidv4(),
            id_usuario: userId,
            id_equipo: newEquipo.id_equipo,
            rol: 'HEAD_COACH',
            permisos: ['ALL'],
            es_principal: true
        });

        res.status(201).json({
            equipo: newEquipo,
            staff: staff,
            message: 'Equipo creado exitosamente'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/my-teams/{id_usuario}:
 *   get:
 *     summary: Get all teams the user is staff of
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of teams with staff info
 */
router.get('/my-teams/:id_usuario', verifyToken, async (req, res, next) => {
    try {
        // Use userId from JWT to prevent IDOR
        // (the URL param is kept for API compatibility but we use the JWT userId)
        const userId = req.userId;

        const staffRecords = await Staff.findByUsuario(userId);
        res.json(staffRecords);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/set-principal/{id_staff}:
 *   patch:
 *     summary: Set a team as the user's principal/main team
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id_staff
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team set as principal
 *       404:
 *         description: Staff record not found
 */
router.patch('/set-principal/:id_staff', verifyToken, async (req, res, next) => {
    try {
        const { id_staff } = req.params;

        if (!isValidUUID(id_staff)) {
            return res.status(400).json({ error: 'ID de staff inválido' });
        }

        // Verify ownership: staff record must belong to the authenticated user
        const staffRecord = await Staff.findById(id_staff);

        if (!staffRecord) {
            return res.status(404).json({ error: 'Staff no encontrado' });
        }

        if (staffRecord.id_usuario !== req.userId) {
            return res.status(403).json({
                error: 'No puedes modificar el equipo principal de otro usuario'
            });
        }

        const staff = await Staff.setPrincipal(id_staff);

        res.json(staff);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/join-team:
 *   post:
 *     summary: Join an existing team using invitation code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_usuario, codigo]
 *             properties:
 *               id_usuario:
 *                 type: string
 *               codigo:
 *                 type: string
 *                 description: 8-character invitation code
 *     responses:
 *       201:
 *         description: Joined team successfully
 *       400:
 *         description: Invalid or expired code
 */
router.post('/join-team', verifyToken, async (req, res, next) => {
    try {
        // Use userId from JWT to prevent impersonation
        const userId = req.userId;
        const { codigo } = req.body;

        if (!codigo || codigo.length !== 8) {
            return res.status(400).json({ error: 'Código de invitación inválido' });
        }

        const invitacionService = require('../services/invitacionService');
        const staff = await invitacionService.redeem(codigo, userId);

        res.status(201).json({
            staff,
            message: 'Te uniste al equipo exitosamente'
        });
    } catch (error) {
        if (error.message.includes('no encontrado') ||
            error.message.includes('utilizada') ||
            error.message.includes('expirado') ||
            error.message.includes('Ya eres')) {
            return res.status(400).json({ error: error.message });
        }
        next(error);
    }
});

function isValidUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

module.exports = router;
