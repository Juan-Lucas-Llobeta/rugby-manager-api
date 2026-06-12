const torneoService = require('../services/torneoService');

/**
 * Controller: Torneo - handles HTTP request/response
 */

async function getAll(req, res, next) {
    try {
        const { temporada, id_equipo } = req.query;

        if (!id_equipo || !isValidUUID(id_equipo)) {
            return res.status(400).json({ error: 'id_equipo es requerido como parámetro de búsqueda' });
        }

        let torneos;
        if (temporada) {
            torneos = await torneoService.getByEquipoAndTemporada(id_equipo, parseInt(temporada));
        } else {
            torneos = await torneoService.getByEquipo(id_equipo);
        }

        res.json(torneos);
    } catch (error) {
        next(error);
    }
}

async function getById(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de torneo inválido' });
        }

        const torneo = await torneoService.getById(id);

        if (!torneo) {
            return res.status(404).json({ error: 'Torneo no encontrado' });
        }

        res.json(torneo);
    } catch (error) {
        next(error);
    }
}

async function create(req, res, next) {
    try {
        const { torneo, temporada_id, id_equipo } = req.body;

        if (!torneo || torneo.trim() === '') {
            return res.status(400).json({ error: 'El nombre del torneo es requerido' });
        }

        const newTorneo = await torneoService.create({ torneo, temporada_id, id_equipo });
        res.status(201).json(newTorneo);
    } catch (error) {
        next(error);
    }
}

async function update(req, res, next) {
    try {
        const { id } = req.params;
        const { torneo, temporada_id, id_equipo } = req.body;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de torneo inválido' });
        }

        const updatedTorneo = await torneoService.update(id, { torneo, temporada_id, id_equipo });

        if (!updatedTorneo) {
            return res.status(404).json({ error: 'Torneo no encontrado' });
        }

        res.json(updatedTorneo);
    } catch (error) {
        next(error);
    }
}

async function deleteTorneo(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de torneo inválido' });
        }

        const deleted = await torneoService.delete(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Torneo no encontrado' });
        }

        res.json({ message: 'Torneo eliminado exitosamente' });
    } catch (error) {
        next(error);
    }
}

/**
 * Get tournament statistics for a team
 */
async function getStats(req, res, next) {
    try {
        const { id } = req.params;
        const { id_equipo } = req.query;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de torneo inválido' });
        }

        if (!id_equipo || !isValidUUID(id_equipo)) {
            return res.status(400).json({ error: 'ID de equipo requerido' });
        }

        // Get tournament info
        const torneo = await torneoService.getById(id);
        if (!torneo) {
            return res.status(404).json({ error: 'Torneo no encontrado' });
        }

        // Calculate stats from matches in this tournament
        const stats = await torneoService.getStatsByEquipo(id, id_equipo);

        res.json({
            id_torneo: id,
            torneo: torneo.torneo,
            temporada_id: torneo.temporada_id,
            ...stats
        });
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
    create,
    update,
    delete: deleteTorneo,
    getStats
};
