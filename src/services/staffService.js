const Staff = require('../models/Staff');
const Usuario = require('../models/Usuario');
const Equipo = require('../models/Equipo');
const { v4: uuidv4 } = require('uuid');

/**
 * Service: Staff business logic
 */

async function getAll() {
    return await Staff.findAll();
}

async function getById(id) {
    return await Staff.findById(id);
}

async function getByEquipo(idEquipo) {
    return await Staff.findByEquipo(idEquipo);
}

async function getByUsuario(idUsuario) {
    return await Staff.findByUsuario(idUsuario);
}

async function create(data) {
    // Validate Usuario exists
    const usuario = await Usuario.findById(data.id_usuario);
    if (!usuario) {
        const error = new Error('El usuario especificado no existe');
        error.status = 400;
        throw error;
    }

    // Validate Equipo exists
    const equipo = await Equipo.findById(data.id_equipo);
    if (!equipo) {
        const error = new Error('El equipo especificado no existe');
        error.status = 400;
        throw error;
    }

    const id = uuidv4();
    return await Staff.create({
        id_staff: id,
        id_usuario: data.id_usuario,
        id_equipo: data.id_equipo,
        rol: data.rol,
        permisos: data.permisos || []
    });
}

async function update(id, data) {
    const existing = await Staff.findById(id);
    if (!existing) return null;

    return await Staff.update(id, {
        rol: data.rol || existing.rol,
        permisos: data.permisos !== undefined ? data.permisos : existing.permisos
    });
}

async function deleteStaff(id) {
    const existing = await Staff.findById(id);
    if (!existing) return false;
    return await Staff.delete(id);
}

module.exports = {
    getAll,
    getById,
    getByEquipo,
    getByUsuario,
    create,
    update,
    delete: deleteStaff
};
