const equipoService = require('../services/equipoService');

/**
 * Controller: Handles HTTP request/response, validation
 */

// GET /api/equipos
async function getAll(req, res, next) {
    try {
        const equipos = await equipoService.getAll();
        res.json(equipos);
    } catch (error) {
        next(error);
    }
}

// GET /api/equipos/:id
async function getById(req, res, next) {
    try {
        const { id } = req.params;

        // Validate UUID format
        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de equipo inválido' });
        }

        const equipo = await equipoService.getById(id);

        if (!equipo) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }

        res.json(equipo);
    } catch (error) {
        next(error);
    }
}

// POST /api/equipos
async function create(req, res, next) {
    try {
        const { equipo, club, temporada_id } = req.body;

        // Validate required fields
        if (!equipo || equipo.trim() === '') {
            return res.status(400).json({ error: 'El nombre del equipo es requerido' });
        }

        const newEquipo = await equipoService.create({ equipo, club, temporada_id });
        res.status(201).json(newEquipo);
    } catch (error) {
        next(error);
    }
}

// PUT /api/equipos/:id
async function update(req, res, next) {
    try {
        const { id } = req.params;
        const { equipo, club, temporada_id } = req.body;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de equipo inválido' });
        }

        if (!equipo || equipo.trim() === '') {
            return res.status(400).json({ error: 'El nombre del equipo es requerido' });
        }

        const updatedEquipo = await equipoService.update(id, { equipo, club, temporada_id });

        if (!updatedEquipo) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }

        res.json(updatedEquipo);
    } catch (error) {
        next(error);
    }
}

// DELETE /api/equipos/:id
async function deleteEquipo(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de equipo inválido' });
        }

        const deleted = await equipoService.delete(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }

        res.json({ message: 'Equipo eliminado exitosamente' });
    } catch (error) {
        next(error);
    }
}

// GET /api/equipos/:id/stats
async function getStats(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de equipo inválido' });
        }

        const stats = await equipoService.getStats(id);

        if (!stats) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }

        res.json(stats);
    } catch (error) {
        next(error);
    }
}

// Helper: Validate UUID format
function isValidUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: deleteEquipo,
    getStats
};
