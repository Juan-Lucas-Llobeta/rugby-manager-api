const Convocatoria = require('../models/Convocatoria');
const Partido = require('../models/Partido');
const Jugador = require('../models/Jugador');
const { v4: uuidv4 } = require('uuid');

/**
 * Service: Convocatoria business logic
 */

async function getAll() {
    return await Convocatoria.findAll();
}

async function getById(id) {
    return await Convocatoria.findById(id);
}

async function getByPartido(idPartido) {
    return await Convocatoria.findByPartido(idPartido);
}

async function getTitulares(idPartido) {
    return await Convocatoria.findTitulares(idPartido);
}

async function getSuplentes(idPartido) {
    return await Convocatoria.findSuplentes(idPartido);
}

async function getByJugador(idJugador) {
    return await Convocatoria.findByJugador(idJugador);
}

async function create(data) {
    // Validate Partido exists
    const partido = await Partido.findById(data.id_partido);
    if (!partido) {
        const error = new Error('El partido especificado no existe');
        error.status = 400;
        throw error;
    }

    // Validate Jugador exists
    const jugador = await Jugador.findById(data.id_jugador);
    if (!jugador) {
        const error = new Error('El jugador especificado no existe');
        error.status = 400;
        throw error;
    }

    const id = uuidv4();
    return await Convocatoria.create({
        id_convocatoria: id,
        id_partido: data.id_partido,
        id_jugador: data.id_jugador,
        tipo: data.tipo,
        posicion: data.posicion,
        numero_camiseta: data.numero_camiseta || null
    });
}

async function update(id, data) {
    const existing = await Convocatoria.findById(id);
    if (!existing) return null;

    return await Convocatoria.update(id, {
        tipo: data.tipo || existing.tipo,
        posicion: data.posicion || existing.posicion,
        numero_camiseta: data.numero_camiseta !== undefined ? data.numero_camiseta : existing.numero_camiseta
    });
}

async function deleteConvocatoria(id) {
    const existing = await Convocatoria.findById(id);
    if (!existing) return false;
    return await Convocatoria.delete(id);
}

async function deleteByPartido(idPartido) {
    const partido = await Partido.findById(idPartido);
    if (!partido) return false;
    return await Convocatoria.deleteByPartido(idPartido);
}

/**
 * Batch update minutes played for all players in a match
 * @param {string} idPartido - Match ID
 * @param {Object[]} playersMinutes - Array of { id_jugador, minutos }
 */
async function updateMinutosByPartido(idPartido, playersMinutes) {
    const partido = await Partido.findById(idPartido);
    if (!partido) {
        const error = new Error('El partido especificado no existe');
        error.status = 404;
        throw error;
    }
    return await Convocatoria.updateMinutosByPartido(idPartido, playersMinutes);
}

module.exports = {
    getAll,
    getById,
    getByPartido,
    getTitulares,
    getSuplentes,
    getByJugador,
    create,
    update,
    delete: deleteConvocatoria,
    deleteByPartido,
    updateMinutosByPartido
};
