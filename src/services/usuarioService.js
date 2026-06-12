const Usuario = require('../models/Usuario');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

/**
 * Service: Usuario business logic
 */

const BCRYPT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} bcrypt hash
 */
async function hashPassword(password) {
    return await bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function getAll() {
    const usuarios = await Usuario.findAll();
    return usuarios.map(u => u.toJSON());
}

async function getById(id) {
    const usuario = await Usuario.findById(id);
    return usuario ? usuario.toJSON() : null;
}

async function getByEmail(correo) {
    const usuario = await Usuario.findByEmail(correo);
    return usuario ? usuario.toJSON() : null;
}

async function create(data) {
    // Check if email already exists
    const existing = await Usuario.findByEmail(data.correo);
    if (existing) {
        const error = new Error('El correo ya está registrado');
        error.status = 400;
        throw error;
    }

    const id = uuidv4();
    const passwordHash = await hashPassword(data.password);

    const usuario = await Usuario.create({
        id_usuario: id,
        correo: data.correo,
        apellido: data.apellido,
        nombre: data.nombre,
        password_hash: passwordHash
    });

    return usuario.toJSON();
}

async function update(id, data) {
    const existing = await Usuario.findById(id);
    if (!existing) return null;

    // If changing email, check it's not taken
    if (data.correo && data.correo !== existing.correo) {
        const emailTaken = await Usuario.findByEmail(data.correo);
        if (emailTaken) {
            const error = new Error('El correo ya está registrado');
            error.status = 400;
            throw error;
        }
    }

    const usuario = await Usuario.update(id, {
        correo: data.correo || existing.correo,
        apellido: data.apellido || existing.apellido,
        nombre: data.nombre || existing.nombre
    });

    return usuario.toJSON();
}

async function updatePassword(id, newPassword) {
    const existing = await Usuario.findById(id);
    if (!existing) return false;

    const passwordHash = await hashPassword(newPassword);
    return await Usuario.updatePassword(id, passwordHash);
}

async function deleteUsuario(id) {
    const existing = await Usuario.findById(id);
    if (!existing) return false;
    return await Usuario.delete(id);
}

module.exports = {
    getAll,
    getById,
    getByEmail,
    create,
    update,
    updatePassword,
    delete: deleteUsuario
};
