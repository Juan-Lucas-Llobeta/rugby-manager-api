const Jugador = require('../models/Jugador');
const Equipo = require('../models/Equipo');
const { v4: uuidv4 } = require('uuid');

/**
 * Service: Jugador business logic
 */

async function getAll() {
    return await Jugador.findAll();
}

async function getById(id) {
    return await Jugador.findById(id);
}

async function getByEquipo(idEquipo) {
    return await Jugador.findByEquipo(idEquipo);
}

async function getByEquipoAndEstado(idEquipo, estado) {
    return await Jugador.findByEquipoAndEstado(idEquipo, estado);
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
    return await Jugador.create({
        id_jugador: id,
        id_equipo: data.id_equipo,
        nombre: data.nombre,
        apellido: data.apellido,
        apodo: data.apodo || null,
        fecha_nacimiento: data.fecha_nacimiento || null,
        peso_kg: data.peso_kg || null,
        altura_cm: data.altura_cm || null,
        posicion_principal: data.posicion_principal,
        posiciones_alternativas: data.posiciones_alternativas || [],
        estado: data.estado || 'DISPONIBLE'
    });
}

async function update(id, data) {
    const existing = await Jugador.findById(id);
    if (!existing) return null;

    return await Jugador.update(id, {
        nombre: data.nombre || existing.nombre,
        apellido: data.apellido || existing.apellido,
        apodo: data.apodo !== undefined ? data.apodo : existing.apodo,
        fecha_nacimiento: data.fecha_nacimiento !== undefined ? data.fecha_nacimiento : existing.fecha_nacimiento,
        peso_kg: data.peso_kg !== undefined ? data.peso_kg : existing.peso_kg,
        altura_cm: data.altura_cm !== undefined ? data.altura_cm : existing.altura_cm,
        posicion_principal: data.posicion_principal || existing.posicion_principal,
        posiciones_alternativas: data.posiciones_alternativas !== undefined ? data.posiciones_alternativas : existing.posiciones_alternativas,
        estado: data.estado || existing.estado
    });
}

async function updateEstado(id, estado) {
    const existing = await Jugador.findById(id);
    if (!existing) return null;
    return await Jugador.updateEstado(id, estado);
}

async function deleteJugador(id) {
    const existing = await Jugador.findById(id);
    if (!existing) return false;
    return await Jugador.delete(id);
}

async function getStats(id) {
    return await Jugador.getStats(id);
}

async function getStatsByEquipo(idEquipo) {
    return await Jugador.getStatsByEquipo(idEquipo);
}

module.exports = {
    getAll,
    getById,
    getByEquipo,
    getByEquipoAndEstado,
    create,
    update,
    updateEstado,
    delete: deleteJugador,
    getStats,
    getStatsByEquipo
};
