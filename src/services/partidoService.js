const Partido = require('../models/Partido');
const Equipo = require('../models/Equipo');
const Torneo = require('../models/Torneo');
const { v4: uuidv4 } = require('uuid');
const torneoService = require('./torneoService');

/**
 * Service: Partido business logic
 */

async function getAll() {
    return await Partido.findAll();
}

async function getById(id) {
    return await Partido.findById(id);
}

async function getByEquipo(idEquipo) {
    return await Partido.findByEquipo(idEquipo);
}

async function getByEquipoAndEstado(idEquipo, estado) {
    return await Partido.findByEquipoAndEstado(idEquipo, estado);
}

async function getUpcoming(idEquipo, limit) {
    return await Partido.findUpcoming(idEquipo, limit);
}

async function create(data) {
    // Validate Equipo exists
    const equipo = await Equipo.findById(data.id_equipo);
    if (!equipo) {
        const error = new Error('El equipo especificado no existe');
        error.status = 400;
        throw error;
    }

    let idTorneo = data.id_torneo;

    // Resolve Torneo: If ID provided, verify. If Name provided, Find or Create.
    if (idTorneo) {
        const torneo = await Torneo.findById(idTorneo);
        if (!torneo) {
            const error = new Error('El torneo especificado no existe');
            error.status = 400;
            throw error;
        }
    } else if (data.nombre_torneo) {
        const torneo = await torneoService.findByNameOrCreate(data.nombre_torneo);
        idTorneo = torneo.id_torneo;
    }

    const id = uuidv4();
    return await Partido.create({
        id_partido: id,
        id_equipo: data.id_equipo,
        id_torneo: idTorneo || null,
        rival: data.rival,
        condicion: data.condicion,
        fecha_hora: data.fecha_hora,
        estado: data.estado || 'PROGRAMADO'
    });
}

async function update(id, data) {
    const existing = await Partido.findById(id);
    if (!existing) return null;

    // Validate Torneo exists if provided
    if (data.id_torneo) {
        const torneo = await Torneo.findById(data.id_torneo);
        if (!torneo) {
            const error = new Error('El torneo especificado no existe');
            error.status = 400;
            throw error;
        }
    }

    return await Partido.update(id, {
        id_torneo: data.id_torneo !== undefined ? data.id_torneo : existing.id_torneo,
        rival: data.rival || existing.rival,
        condicion: data.condicion || existing.condicion,
        fecha_hora: data.fecha_hora || existing.fecha_hora,
        marcador_propio: data.marcador_propio !== undefined ? data.marcador_propio : existing.marcador_propio,
        marcador_rival: data.marcador_rival !== undefined ? data.marcador_rival : existing.marcador_rival,
        estado: data.estado || existing.estado
    });
}

async function updateMarcador(id, marcadorPropio, marcadorRival) {
    const existing = await Partido.findById(id);
    if (!existing) return null;
    return await Partido.updateMarcador(id, marcadorPropio, marcadorRival);
}

async function updateEstado(id, estado) {
    const existing = await Partido.findById(id);
    if (!existing) return null;
    return await Partido.updateEstado(id, estado);
}

async function deletePartido(id) {
    const existing = await Partido.findById(id);
    if (!existing) return false;
    return await Partido.delete(id);
}

module.exports = {
    getAll,
    getById,
    getByEquipo,
    getByEquipoAndEstado,
    getUpcoming,
    create,
    update,
    updateMarcador,
    updateEstado,
    delete: deletePartido
};
