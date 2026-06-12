const staffService = require('../services/staffService');

/**
 * Controller: Staff - handles HTTP request/response
 */

const VALID_ROLES = ['HEAD_COACH', 'ENTRENADOR', 'MANAGER'];

async function getAll(req, res, next) {
    try {
        const staff = await staffService.getAll();
        res.json(staff);
    } catch (error) {
        next(error);
    }
}

async function getById(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de staff inválido' });
        }

        const staff = await staffService.getById(id);

        if (!staff) {
            return res.status(404).json({ error: 'Staff no encontrado' });
        }

        res.json(staff);
    } catch (error) {
        next(error);
    }
}

async function getByEquipo(req, res, next) {
    try {
        const { idEquipo } = req.params;

        if (!isValidUUID(idEquipo)) {
            return res.status(400).json({ error: 'ID de equipo inválido' });
        }

        const staff = await staffService.getByEquipo(idEquipo);
        res.json(staff);
    } catch (error) {
        next(error);
    }
}

async function create(req, res, next) {
    try {
        const { id_usuario, id_equipo, rol, permisos } = req.body;

        if (!id_usuario || !isValidUUID(id_usuario)) {
            return res.status(400).json({ error: 'ID de usuario inválido' });
        }
        if (!id_equipo || !isValidUUID(id_equipo)) {
            return res.status(400).json({ error: 'ID de equipo inválido' });
        }
        if (!rol || !VALID_ROLES.includes(rol)) {
            return res.status(400).json({ error: `Rol inválido. Valores permitidos: ${VALID_ROLES.join(', ')}` });
        }

        const staff = await staffService.create({ id_usuario, id_equipo, rol, permisos });
        res.status(201).json(staff);
    } catch (error) {
        next(error);
    }
}

async function update(req, res, next) {
    try {
        const { id } = req.params;
        const { rol, permisos } = req.body;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de staff inválido' });
        }

        if (rol && !VALID_ROLES.includes(rol)) {
            return res.status(400).json({ error: `Rol inválido. Valores permitidos: ${VALID_ROLES.join(', ')}` });
        }

        const staff = await staffService.update(id, { rol, permisos });

        if (!staff) {
            return res.status(404).json({ error: 'Staff no encontrado' });
        }

        res.json(staff);
    } catch (error) {
        next(error);
    }
}

async function deleteStaff(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de staff inválido' });
        }

        const deleted = await staffService.delete(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Staff no encontrado' });
        }

        res.json({ message: 'Staff eliminado exitosamente' });
    } catch (error) {
        next(error);
    }
}

function isValidUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

module.exports = {
    getAll,
    getById,
    getByEquipo,
    create,
    update,
    delete: deleteStaff
};
