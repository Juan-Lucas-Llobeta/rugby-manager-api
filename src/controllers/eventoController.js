const eventoService = require('../services/eventoService');

/**
 * Controller: EventoPartido - handles HTTP request/response
 */

const VALID_TIPOS_PUNTAJE = ['TRY', 'CONVERSION', 'PENAL', 'DROP_GOAL', 'TRY_PENAL', 'PENAL_MISSED', 'CONVERSION_MISSED', 'DROP_GOAL_MISSED'];
const VALID_TIPOS_FORMACION = ['SCRUM', 'LINEOUT', 'RED_CARD', 'YELLOW_CARD', 'SUSTITUCION', 'CAMBIO_PERIODO'];
const VALID_RESULTADOS = ['GANADO', 'PERDIDO'];

// ALL EVENTS
async function getByPartido(req, res, next) {
    try {
        const { idPartido } = req.params;

        if (!isValidUUID(idPartido)) {
            return res.status(400).json({ error: 'ID de partido inválido' });
        }

        const eventos = await eventoService.getByPartido(idPartido);
        res.json(eventos);
    } catch (error) {
        next(error);
    }
}

async function getById(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de evento inválido' });
        }

        const evento = await eventoService.getById(id);

        if (!evento) {
            return res.status(404).json({ error: 'Evento no encontrado' });
        }

        res.json(evento);
    } catch (error) {
        next(error);
    }
}

async function deleteEvento(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de evento inválido' });
        }

        const deleted = await eventoService.delete(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Evento no encontrado' });
        }

        res.json({ message: 'Evento eliminado exitosamente' });
    } catch (error) {
        next(error);
    }
}

// PUNTAJE EVENTS
async function getPuntajeByPartido(req, res, next) {
    try {
        const { idPartido } = req.params;

        if (!isValidUUID(idPartido)) {
            return res.status(400).json({ error: 'ID de partido inválido' });
        }

        const eventos = await eventoService.getPuntajeByPartido(idPartido);
        res.json(eventos);
    } catch (error) {
        next(error);
    }
}

async function createPuntaje(req, res, next) {
    try {
        const { id_partido, minuto, es_propio, tipo, id_jugador, periodo } = req.body;

        if (!id_partido || !isValidUUID(id_partido)) {
            return res.status(400).json({ error: 'ID de partido inválido' });
        }
        if (minuto === undefined || minuto < 0) {
            return res.status(400).json({ error: 'Minuto requerido y debe ser >= 0' });
        }
        if (!tipo || !VALID_TIPOS_PUNTAJE.includes(tipo)) {
            return res.status(400).json({ error: `Tipo inválido. Valores: ${VALID_TIPOS_PUNTAJE.join(', ')}` });
        }
        if (id_jugador && !isValidUUID(id_jugador)) {
            return res.status(400).json({ error: 'ID de jugador inválido' });
        }

        const evento = await eventoService.createPuntaje({
            id_partido, minuto, es_propio, tipo, id_jugador, periodo
        });

        res.status(201).json(evento);
    } catch (error) {
        next(error);
    }
}

async function updatePuntaje(req, res, next) {
    try {
        const { id } = req.params;
        const { minuto, es_propio, tipo, id_jugador } = req.body;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de evento inválido' });
        }
        if (tipo && !VALID_TIPOS_PUNTAJE.includes(tipo)) {
            return res.status(400).json({ error: `Tipo inválido. Valores: ${VALID_TIPOS_PUNTAJE.join(', ')}` });
        }

        const evento = await eventoService.updatePuntaje(id, {
            minuto, es_propio, tipo, id_jugador
        });

        if (!evento) {
            return res.status(404).json({ error: 'Evento no encontrado' });
        }

        res.json(evento);
    } catch (error) {
        next(error);
    }
}

async function getPuntajeStatsByJugador(req, res, next) {
    try {
        const { idJugador } = req.params;

        if (!isValidUUID(idJugador)) {
            return res.status(400).json({ error: 'ID de jugador inválido' });
        }

        const stats = await eventoService.getPuntajeStatsByJugador(idJugador);
        res.json(stats);
    } catch (error) {
        next(error);
    }
}

// FORMACION EVENTS
async function getFormacionByPartido(req, res, next) {
    try {
        const { idPartido } = req.params;

        if (!isValidUUID(idPartido)) {
            return res.status(400).json({ error: 'ID de partido inválido' });
        }

        const eventos = await eventoService.getFormacionByPartido(idPartido);
        res.json(eventos);
    } catch (error) {
        next(error);
    }
}

async function createFormacion(req, res, next) {
    try {
        const { id_partido, minuto, es_propio, tipo, resultado, id_jugador, periodo } = req.body;

        if (!id_partido || !isValidUUID(id_partido)) {
            return res.status(400).json({ error: 'ID de partido inválido' });
        }
        if (minuto === undefined || minuto < 0) {
            return res.status(400).json({ error: 'Minuto requerido y debe ser >= 0' });
        }
        if (!tipo || !VALID_TIPOS_FORMACION.includes(tipo)) {
            return res.status(400).json({ error: `Tipo inválido. Valores: ${VALID_TIPOS_FORMACION.join(', ')}` });
        }
        if (resultado && !VALID_RESULTADOS.includes(resultado)) {
            return res.status(400).json({ error: `Resultado inválido. Valores: ${VALID_RESULTADOS.join(', ')}` });
        }
        if (id_jugador && !isValidUUID(id_jugador)) {
            return res.status(400).json({ error: 'ID de jugador inválido' });
        }

        const evento = await eventoService.createFormacion({
            id_partido, minuto, es_propio, tipo, resultado, id_jugador, periodo
        });

        res.status(201).json(evento);
    } catch (error) {
        next(error);
    }
}

async function updateFormacion(req, res, next) {
    try {
        const { id } = req.params;
        const { minuto, es_propio, tipo, resultado } = req.body;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de evento inválido' });
        }
        if (tipo && !VALID_TIPOS_FORMACION.includes(tipo)) {
            return res.status(400).json({ error: `Tipo inválido. Valores: ${VALID_TIPOS_FORMACION.join(', ')}` });
        }
        if (resultado && !VALID_RESULTADOS.includes(resultado)) {
            return res.status(400).json({ error: `Resultado inválido. Valores: ${VALID_RESULTADOS.join(', ')}` });
        }

        const evento = await eventoService.updateFormacion(id, {
            minuto, es_propio, tipo, resultado
        });

        if (!evento) {
            return res.status(404).json({ error: 'Evento no encontrado' });
        }

        res.json(evento);
    } catch (error) {
        next(error);
    }
}

async function getFormacionStatsByPartido(req, res, next) {
    try {
        const { idPartido } = req.params;

        if (!isValidUUID(idPartido)) {
            return res.status(400).json({ error: 'ID de partido inválido' });
        }

        const stats = await eventoService.getFormacionStatsByPartido(idPartido);
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
    getByPartido,
    getById,
    delete: deleteEvento,
    // Puntaje
    getPuntajeByPartido,
    createPuntaje,
    updatePuntaje,
    getPuntajeStatsByJugador,
    // Formacion
    getFormacionByPartido,
    createFormacion,
    updateFormacion,
    getFormacionStatsByPartido
};
