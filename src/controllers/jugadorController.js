const jugadorService = require('../services/jugadorService');

/**
 * Controller: Jugador - handles HTTP request/response
 */

const VALID_ESTADOS = ['DISPONIBLE', 'LESIONADO', 'SUSPENDIDO', 'NO_DISPONIBLE'];

async function getAll(req, res, next) {
    try {
        const { idEquipo, estado } = req.query;

        // Require team ID for security - prevent fetching all players
        if (!idEquipo || !isValidUUID(idEquipo)) {
            return res.status(400).json({
                error: 'idEquipo es requerido como parámetro de búsqueda'
            });
        }

        let jugadores;
        if (estado && VALID_ESTADOS.includes(estado)) {
            jugadores = await jugadorService.getByEquipoAndEstado(idEquipo, estado);
        } else {
            jugadores = await jugadorService.getByEquipo(idEquipo);
        }

        res.json(jugadores);
    } catch (error) {
        next(error);
    }
}

async function getById(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de jugador inválido' });
        }

        const jugador = await jugadorService.getById(id);

        if (!jugador) {
            return res.status(404).json({ error: 'Jugador no encontrado' });
        }

        res.json(jugador);
    } catch (error) {
        next(error);
    }
}

async function getByEquipo(req, res, next) {
    try {
        const { idEquipo } = req.params;
        const { estado } = req.query;

        if (!isValidUUID(idEquipo)) {
            return res.status(400).json({ error: 'ID de equipo inválido' });
        }

        let jugadores;
        if (estado && VALID_ESTADOS.includes(estado)) {
            jugadores = await jugadorService.getByEquipoAndEstado(idEquipo, estado);
        } else {
            jugadores = await jugadorService.getByEquipo(idEquipo);
        }

        res.json(jugadores);
    } catch (error) {
        next(error);
    }
}

async function create(req, res, next) {
    try {
        const {
            id_equipo, nombre, apellido, apodo,
            fecha_nacimiento, peso_kg, altura_cm,
            posicion_principal, posiciones_alternativas, estado
        } = req.body;

        if (!id_equipo || !isValidUUID(id_equipo)) {
            return res.status(400).json({ error: 'ID de equipo inválido' });
        }
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre es requerido' });
        }
        if (!apellido || apellido.trim() === '') {
            return res.status(400).json({ error: 'El apellido es requerido' });
        }
        if (!posicion_principal || posicion_principal.trim() === '') {
            return res.status(400).json({ error: 'La posición principal es requerida' });
        }
        if (estado && !VALID_ESTADOS.includes(estado)) {
            return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${VALID_ESTADOS.join(', ')}` });
        }

        const jugador = await jugadorService.create({
            id_equipo, nombre, apellido, apodo,
            fecha_nacimiento, peso_kg, altura_cm,
            posicion_principal, posiciones_alternativas, estado
        });

        res.status(201).json(jugador);
    } catch (error) {
        next(error);
    }
}

async function update(req, res, next) {
    try {
        const { id } = req.params;
        const {
            nombre, apellido, apodo,
            fecha_nacimiento, peso_kg, altura_cm,
            posicion_principal, posiciones_alternativas, estado
        } = req.body;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de jugador inválido' });
        }
        if (estado && !VALID_ESTADOS.includes(estado)) {
            return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${VALID_ESTADOS.join(', ')}` });
        }

        const jugador = await jugadorService.update(id, {
            nombre, apellido, apodo,
            fecha_nacimiento, peso_kg, altura_cm,
            posicion_principal, posiciones_alternativas, estado
        });

        if (!jugador) {
            return res.status(404).json({ error: 'Jugador no encontrado' });
        }

        res.json(jugador);
    } catch (error) {
        next(error);
    }
}

async function updateEstado(req, res, next) {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de jugador inválido' });
        }
        if (!estado || !VALID_ESTADOS.includes(estado)) {
            return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${VALID_ESTADOS.join(', ')}` });
        }

        const jugador = await jugadorService.updateEstado(id, estado);

        if (!jugador) {
            return res.status(404).json({ error: 'Jugador no encontrado' });
        }

        res.json(jugador);
    } catch (error) {
        next(error);
    }
}

async function deleteJugador(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de jugador inválido' });
        }

        const deleted = await jugadorService.delete(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Jugador no encontrado' });
        }

        res.json({ message: 'Jugador eliminado exitosamente' });
    } catch (error) {
        next(error);
    }
}

async function getStats(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de jugador inválido' });
        }

        const stats = await jugadorService.getStats(id);

        if (!stats) {
            return res.status(404).json({ error: 'Jugador no encontrado' });
        }

        res.json(stats);
    } catch (error) {
        next(error);
    }
}

async function getStatsByEquipo(req, res, next) {
    try {
        const { idEquipo } = req.params;

        if (!isValidUUID(idEquipo)) {
            return res.status(400).json({ error: 'ID de equipo inválido' });
        }

        const stats = await jugadorService.getStatsByEquipo(idEquipo);
        res.json(stats);
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
    updateEstado,
    delete: deleteJugador,
    getStats,
    getStatsByEquipo
};
