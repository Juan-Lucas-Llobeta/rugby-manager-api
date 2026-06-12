const { EventoPartido, EventoPuntaje, EventoFormacion } = require('../models/EventoPartido');
const Partido = require('../models/Partido');
const Jugador = require('../models/Jugador');
const { v4: uuidv4 } = require('uuid');

/**
 * Service: EventoPartido business logic
 */

// Get all events for a match
async function getByPartido(idPartido) {
    return await EventoPartido.findByPartido(idPartido);
}

async function getById(id) {
    return await EventoPartido.findById(id);
}

async function deleteEvento(id) {
    const existing = await EventoPartido.findById(id);
    if (!existing) return false;
    return await EventoPartido.delete(id);
}

// PUNTAJE EVENTS
async function getPuntajeByPartido(idPartido) {
    return await EventoPuntaje.findByPartido(idPartido);
}

async function createPuntaje(data) {
    const partido = await Partido.findById(data.id_partido);
    if (!partido) {
        const error = new Error('El partido especificado no existe');
        error.status = 400;
        throw error;
    }

    if (data.id_jugador) {
        const jugador = await Jugador.findById(data.id_jugador);
        if (!jugador) {
            const error = new Error('El jugador especificado no existe');
            error.status = 400;
            throw error;
        }
    }

    const id = uuidv4();
    return await EventoPuntaje.create({
        id_evento: id,
        id_partido: data.id_partido,
        minuto: data.minuto,
        es_propio: data.es_propio !== undefined ? data.es_propio : true,
        tipo: data.tipo,
        id_jugador: data.id_jugador || null,
        periodo: data.periodo || 1
    });
}

async function updatePuntaje(id, data) {
    const existing = await EventoPartido.findById(id);
    if (!existing) return null;

    return await EventoPuntaje.update(id, {
        minuto: data.minuto !== undefined ? data.minuto : existing.minuto,
        es_propio: data.es_propio !== undefined ? data.es_propio : existing.es_propio,
        tipo: data.tipo || existing.tipo,
        id_jugador: data.id_jugador !== undefined ? data.id_jugador : existing.id_jugador
    });
}

async function getPuntajeStatsByJugador(idJugador) {
    return await EventoPuntaje.getStatsByJugador(idJugador);
}

// FORMACION EVENTS
async function getFormacionByPartido(idPartido) {
    return await EventoFormacion.findByPartido(idPartido);
}

async function createFormacion(data) {
    const partido = await Partido.findById(data.id_partido);
    if (!partido) {
        const error = new Error('El partido especificado no existe');
        error.status = 400;
        throw error;
    }

    // Validate player if provided
    if (data.id_jugador) {
        const jugador = await Jugador.findById(data.id_jugador);
        if (!jugador) {
            const error = new Error('El jugador especificado no existe');
            error.status = 400;
            throw error;
        }
    }

    const id = uuidv4();
    return await EventoFormacion.create({
        id_evento: id,
        id_partido: data.id_partido,
        minuto: data.minuto,
        es_propio: data.es_propio !== undefined ? data.es_propio : true,
        tipo: data.tipo,
        resultado: data.resultado || null,
        id_jugador: data.id_jugador || null,
        periodo: data.periodo || 1
    });
}

async function updateFormacion(id, data) {
    const existing = await EventoPartido.findById(id);
    if (!existing) return null;

    return await EventoFormacion.update(id, {
        minuto: data.minuto !== undefined ? data.minuto : existing.minuto,
        es_propio: data.es_propio !== undefined ? data.es_propio : existing.es_propio,
        tipo: data.tipo || existing.tipo,
        resultado: data.resultado !== undefined ? data.resultado : existing.resultado
    });
}

async function getFormacionStatsByPartido(idPartido) {
    return await EventoFormacion.getStatsByPartido(idPartido);
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
