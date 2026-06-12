const Equipo = require('../models/Equipo');
const { v4: uuidv4 } = require('uuid');

/**
 * Service: Business logic, model instantiation, orchestration
 */

async function getAll() {
    return await Equipo.findAll();
}

async function getById(id) {
    return await Equipo.findById(id);
}

async function create(data) {
    const id = uuidv4();
    return await Equipo.create({
        id_equipo: id,
        equipo: data.equipo,
        club: data.club || null,
        temporada_id: data.temporada_id || null
    });
}

async function update(id, data) {
    // Check if exists first
    const existing = await Equipo.findById(id);
    if (!existing) {
        return null;
    }

    return await Equipo.update(id, {
        equipo: data.equipo,
        club: data.club || null,
        temporada_id: data.temporada_id || null
    });
}

async function deleteEquipo(id) {
    // Check if exists first
    const existing = await Equipo.findById(id);
    if (!existing) {
        return false;
    }

    return await Equipo.delete(id);
}

async function getStats(id) {
    const existing = await Equipo.findById(id);
    if (!existing) return null;
    return await Equipo.getStats(id);
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: deleteEquipo,
    getStats
};
