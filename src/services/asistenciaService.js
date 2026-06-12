const Asistencia = require('../models/Asistencia');
const Entrenamiento = require('../models/Entrenamiento');
const Jugador = require('../models/Jugador');
const { v4: uuidv4 } = require('uuid');

/**
 * Service: Asistencia business logic
 */

async function getAll() {
    return await Asistencia.findAll();
}

async function getById(id) {
    return await Asistencia.findById(id);
}

async function getByEntrenamiento(idEntrenamiento) {
    return await Asistencia.findByEntrenamiento(idEntrenamiento);
}

async function getByJugador(idJugador) {
    return await Asistencia.findByJugador(idJugador);
}

async function getStatsByJugador(idJugador) {
    return await Asistencia.getStatsByJugador(idJugador);
}

async function create(data) {
    // Validate Entrenamiento exists
    const entrenamiento = await Entrenamiento.findById(data.id_entrenamiento);
    if (!entrenamiento) {
        const error = new Error('El entrenamiento especificado no existe');
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
    return await Asistencia.create({
        id_asistencia: id,
        id_entrenamiento: data.id_entrenamiento,
        id_jugador: data.id_jugador,
        estado: data.estado,
        motivo_ausencia: data.motivo_ausencia || null,
        hora_llegada: data.hora_llegada || null
    });
}

async function update(id, data) {
    const existing = await Asistencia.findById(id);
    if (!existing) return null;

    return await Asistencia.update(id, {
        estado: data.estado || existing.estado,
        motivo_ausencia: data.motivo_ausencia !== undefined ? data.motivo_ausencia : existing.motivo_ausencia,
        hora_llegada: data.hora_llegada !== undefined ? data.hora_llegada : existing.hora_llegada
    });
}

async function deleteAsistencia(id) {
    const existing = await Asistencia.findById(id);
    if (!existing) return false;
    return await Asistencia.delete(id);
}

async function bulkCreate(idEntrenamiento, defaultEstado = 'AUSENTE') {
    const entrenamiento = await Entrenamiento.findById(idEntrenamiento);
    if (!entrenamiento) {
        const error = new Error('El entrenamiento especificado no existe');
        error.status = 400;
        throw error;
    }
    return await Asistencia.bulkCreate(idEntrenamiento, defaultEstado);
}

module.exports = {
    getAll,
    getById,
    getByEntrenamiento,
    getByJugador,
    getStatsByJugador,
    create,
    update,
    delete: deleteAsistencia,
    bulkCreate
};
