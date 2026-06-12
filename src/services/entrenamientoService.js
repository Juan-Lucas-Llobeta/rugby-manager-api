const Entrenamiento = require('../models/Entrenamiento');
const Equipo = require('../models/Equipo');
const { v4: uuidv4 } = require('uuid');

/**
 * Service: Entrenamiento business logic
 */

async function getAll() {
    return await Entrenamiento.findAll();
}

async function getById(id) {
    return await Entrenamiento.findById(id);
}

async function getByEquipo(idEquipo) {
    return await Entrenamiento.findByEquipo(idEquipo);
}

async function getByEquipoAndEstado(idEquipo, estado) {
    return await Entrenamiento.findByEquipoAndEstado(idEquipo, estado);
}

async function getUpcoming(idEquipo, limit) {
    return await Entrenamiento.findUpcoming(idEquipo, limit);
}

async function create(data) {
    // Validate Equipo exists
    const equipo = await Equipo.findById(data.id_equipo);
    if (!equipo) {
        const error = new Error('El equipo especificado no existe');
        error.status = 400;
        throw error;
    }

    const id = uuidv4();
    return await Entrenamiento.create({
        id_entrenamiento: id,
        id_equipo: data.id_equipo,
        fecha_hora: data.fecha_hora,
        enfoque: data.enfoque || null,
        ubicacion: data.ubicacion || null,
        duracion_minutos: data.duracion_minutos || null,
        estado: data.estado || 'PROGRAMADO',
        notas: data.notas || null
    });
}

async function update(id, data) {
    const existing = await Entrenamiento.findById(id);
    if (!existing) return null;

    return await Entrenamiento.update(id, {
        fecha_hora: data.fecha_hora || existing.fecha_hora,
        enfoque: data.enfoque !== undefined ? data.enfoque : existing.enfoque,
        ubicacion: data.ubicacion !== undefined ? data.ubicacion : existing.ubicacion,
        duracion_minutos: data.duracion_minutos !== undefined ? data.duracion_minutos : existing.duracion_minutos,
        estado: data.estado || existing.estado,
        notas: data.notas !== undefined ? data.notas : existing.notas
    });
}

async function updateEstado(id, estado) {
    const existing = await Entrenamiento.findById(id);
    if (!existing) return null;
    return await Entrenamiento.updateEstado(id, estado);
}

async function deleteEntrenamiento(id) {
    const existing = await Entrenamiento.findById(id);
    if (!existing) return false;
    return await Entrenamiento.delete(id);
}

module.exports = {
    getAll,
    getById,
    getByEquipo,
    getByEquipoAndEstado,
    getUpcoming,
    create,
    update,
    updateEstado,
    delete: deleteEntrenamiento
};
