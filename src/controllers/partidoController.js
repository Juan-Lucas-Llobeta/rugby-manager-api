const partidoService = require('../services/partidoService');

/**
 * Controller: Partido - handles HTTP request/response
 */

const VALID_ESTADOS = ['PROGRAMADO', 'EN_JUEGO', 'ENTRETIEMPO', 'JUGADO'];
const VALID_CONDICIONES = ['LOCAL', 'VISITANTE'];

async function getAll(req, res, next) {
    try {
        const { idEquipo, estado, upcoming, limit } = req.query;

        // Require team ID for security - prevent fetching all matches
        if (!idEquipo || !isValidUUID(idEquipo)) {
            return res.status(400).json({
                error: 'idEquipo es requerido como parámetro de búsqueda'
            });
        }

        let partidos;
        if (upcoming === 'true') {
            partidos = await partidoService.getUpcoming(idEquipo, parseInt(limit) || 5);
        } else if (estado && VALID_ESTADOS.includes(estado)) {
            partidos = await partidoService.getByEquipoAndEstado(idEquipo, estado);
        } else {
            partidos = await partidoService.getByEquipo(idEquipo);
        }

        res.json(partidos);
    } catch (error) {
        next(error);
    }
}

async function getById(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de partido inválido' });
        }

        const partido = await partidoService.getById(id);

        if (!partido) {
            return res.status(404).json({ error: 'Partido no encontrado' });
        }

        res.json(partido);
    } catch (error) {
        next(error);
    }
}

async function getByEquipo(req, res, next) {
    try {
        const { idEquipo } = req.params;
        const { estado, upcoming, limit } = req.query;

        if (!isValidUUID(idEquipo)) {
            return res.status(400).json({ error: 'ID de equipo inválido' });
        }

        let partidos;
        if (upcoming === 'true') {
            partidos = await partidoService.getUpcoming(idEquipo, parseInt(limit) || 5);
        } else if (estado && VALID_ESTADOS.includes(estado)) {
            partidos = await partidoService.getByEquipoAndEstado(idEquipo, estado);
        } else {
            partidos = await partidoService.getByEquipo(idEquipo);
        }

        res.json(partidos);
    } catch (error) {
        next(error);
    }
}

async function create(req, res, next) {
    try {
        const { id_equipo, id_torneo, nombre_torneo, rival, condicion, fecha_hora, estado } = req.body;

        if (!id_equipo || !isValidUUID(id_equipo)) {
            return res.status(400).json({ error: 'ID de equipo inválido' });
        }
        if (id_torneo && !isValidUUID(id_torneo)) {
            return res.status(400).json({ error: 'ID de torneo inválido' });
        }
        if (!rival || rival.trim() === '') {
            return res.status(400).json({ error: 'El nombre del rival es requerido' });
        }
        if (!condicion || !VALID_CONDICIONES.includes(condicion)) {
            return res.status(400).json({ error: `Condición inválida. Valores permitidos: ${VALID_CONDICIONES.join(', ')}` });
        }
        if (!fecha_hora) {
            return res.status(400).json({ error: 'La fecha y hora son requeridas' });
        }
        if (estado && !VALID_ESTADOS.includes(estado)) {
            return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${VALID_ESTADOS.join(', ')}` });
        }

        const partido = await partidoService.create({
            id_equipo, id_torneo, nombre_torneo, rival, condicion, fecha_hora, estado
        });

        res.status(201).json(partido);
    } catch (error) {
        next(error);
    }
}

async function update(req, res, next) {
    try {
        const { id } = req.params;
        const { id_torneo, rival, condicion, fecha_hora, marcador_propio, marcador_rival, estado } = req.body;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de partido inválido' });
        }
        if (id_torneo && !isValidUUID(id_torneo)) {
            return res.status(400).json({ error: 'ID de torneo inválido' });
        }
        if (condicion && !VALID_CONDICIONES.includes(condicion)) {
            return res.status(400).json({ error: `Condición inválida. Valores permitidos: ${VALID_CONDICIONES.join(', ')}` });
        }
        if (estado && !VALID_ESTADOS.includes(estado)) {
            return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${VALID_ESTADOS.join(', ')}` });
        }

        const partido = await partidoService.update(id, {
            id_torneo, rival, condicion, fecha_hora, marcador_propio, marcador_rival, estado
        });

        if (!partido) {
            return res.status(404).json({ error: 'Partido no encontrado' });
        }

        res.json(partido);
    } catch (error) {
        next(error);
    }
}

async function updateMarcador(req, res, next) {
    try {
        const { id } = req.params;
        const { marcador_propio, marcador_rival } = req.body;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de partido inválido' });
        }
        if (marcador_propio === undefined || marcador_rival === undefined) {
            return res.status(400).json({ error: 'Ambos marcadores son requeridos' });
        }

        const partido = await partidoService.updateMarcador(id, marcador_propio, marcador_rival);

        if (!partido) {
            return res.status(404).json({ error: 'Partido no encontrado' });
        }

        res.json(partido);
    } catch (error) {
        next(error);
    }
}

async function updateEstado(req, res, next) {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de partido inválido' });
        }
        if (!estado || !VALID_ESTADOS.includes(estado)) {
            return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${VALID_ESTADOS.join(', ')}` });
        }

        const partido = await partidoService.updateEstado(id, estado);

        if (!partido) {
            return res.status(404).json({ error: 'Partido no encontrado' });
        }

        res.json(partido);
    } catch (error) {
        next(error);
    }
}

async function deletePartido(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de partido inválido' });
        }

        const deleted = await partidoService.delete(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Partido no encontrado' });
        }

        res.json({ message: 'Partido eliminado exitosamente' });
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
    updateMarcador,
    updateEstado,
    delete: deletePartido
};
