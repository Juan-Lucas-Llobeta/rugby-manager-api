const invitacionService = require('../services/invitacionService');

/**
 * Controller: Invitacion - handles HTTP request/response
 */

const VALID_ROLES = ['ENTRENADOR', 'MANAGER'];

/**
 * Create invitation code
 * POST /api/invitaciones
 */
async function create(req, res, next) {
    try {
        const { id_equipo, rol, id_creador } = req.body;

        if (!id_equipo || !isValidUUID(id_equipo)) {
            return res.status(400).json({ error: 'ID de equipo inválido' });
        }
        if (!id_creador || !isValidUUID(id_creador)) {
            return res.status(400).json({ error: 'ID de creador (staff) inválido' });
        }
        if (!rol || !VALID_ROLES.includes(rol)) {
            return res.status(400).json({
                error: `Rol inválido. Valores permitidos: ${VALID_ROLES.join(', ')}`
            });
        }

        const invitacion = await invitacionService.create({ id_equipo, rol, id_creador });
        res.status(201).json(invitacion);
    } catch (error) {
        // Handle specific SP errors
        if (error.message.includes('HEAD_COACH')) {
            return res.status(403).json({ error: error.message });
        }
        next(error);
    }
}

/**
 * Get all invitations for a team
 * GET /api/invitaciones/equipo/:id
 */
async function getByEquipo(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de equipo inválido' });
        }

        const invitaciones = await invitacionService.findByEquipo(id);
        res.json(invitaciones);
    } catch (error) {
        next(error);
    }
}

/**
 * Validate invitation code (public, no auth needed)
 * GET /api/invitaciones/validate/:codigo
 */
async function validate(req, res, next) {
    try {
        const { codigo } = req.params;

        if (!codigo || codigo.length !== 8) {
            return res.status(400).json({ error: 'Código inválido' });
        }

        const result = await invitacionService.validate(codigo);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

/**
 * Delete invitation
 * DELETE /api/invitaciones/:id
 */
async function deleteInvitacion(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de invitación inválido' });
        }

        const deleted = await invitacionService.delete(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Invitación no encontrada' });
        }

        res.json({ message: 'Invitación eliminada exitosamente' });
    } catch (error) {
        next(error);
    }
}

function isValidUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

module.exports = {
    create,
    getByEquipo,
    validate,
    delete: deleteInvitacion
};
