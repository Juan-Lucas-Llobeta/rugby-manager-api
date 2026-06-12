const Torneo = require('../models/Torneo');
const { v4: uuidv4 } = require('uuid');

/**
 * Service: Torneo business logic
 */

async function getAll() {
    return await Torneo.findAll();
}

async function getById(id) {
    return await Torneo.findById(id);
}

async function getByTemporada(temporadaId) {
    return await Torneo.findByTemporada(temporadaId);
}

async function getByEquipo(idEquipo) {
    return await Torneo.findByEquipo(idEquipo);
}

async function getByEquipoAndTemporada(idEquipo, temporadaId) {
    return await Torneo.findByEquipoAndTemporada(idEquipo, temporadaId);
}

async function create(data) {
    const id = uuidv4();
    return await Torneo.create({
        id_torneo: id,
        torneo: data.torneo,
        temporada_id: data.temporada_id || null,
        id_equipo: data.id_equipo || null
    });
}

async function findByNameOrCreate(name, idEquipo = null) {
    let torneo = await Torneo.findByName(name, idEquipo);
    if (!torneo) {
        const id = uuidv4();
        torneo = await Torneo.create({
            id_torneo: id,
            torneo: name,
            temporada_id: null, // Default null for on-the-fly creation
            id_equipo: idEquipo
        });
    }
    return torneo;
}

async function update(id, data) {
    const existing = await Torneo.findById(id);
    if (!existing) return null;

    return await Torneo.update(id, {
        torneo: data.torneo || existing.torneo,
        temporada_id: data.temporada_id !== undefined ? data.temporada_id : existing.temporada_id,
        id_equipo: data.id_equipo !== undefined ? data.id_equipo : existing.id_equipo
    });
}

async function deleteTorneo(id) {
    const existing = await Torneo.findById(id);
    if (!existing) return false;
    return await Torneo.delete(id);
}

/**
 * Get tournament statistics for a specific team
 * Delegates to Torneo model which calls stored procedure
 */
async function getStatsByEquipo(idTorneo, idEquipo) {
    return await Torneo.getStatsByEquipo(idTorneo, idEquipo);
}

module.exports = {
    getAll,
    getById,
    getByTemporada,
    getByEquipo,
    getByEquipoAndTemporada,
    create,
    findByNameOrCreate,
    update,
    delete: deleteTorneo,
    getStatsByEquipo
};
