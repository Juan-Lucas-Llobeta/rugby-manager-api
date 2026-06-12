const { v4: uuidv4 } = require('uuid');
const Invitacion = require('../models/Invitacion');

/**
 * Service: Invitacion - business logic for team invitations
 */

async function create(data) {
    const invitacionData = {
        id_invitacion: uuidv4(),
        id_equipo: data.id_equipo,
        codigo: Invitacion.generateCode(),
        rol: data.rol,
        id_creador: data.id_creador
    };

    return await Invitacion.create(invitacionData);
}

async function findByCodigo(codigo) {
    return await Invitacion.findByCodigo(codigo.toUpperCase());
}

async function findByEquipo(idEquipo) {
    return await Invitacion.findByEquipo(idEquipo);
}

async function redeem(codigo, idUsuario) {
    const idStaff = uuidv4();
    return await Invitacion.redeem(codigo.toUpperCase(), idUsuario, idStaff);
}

async function deleteInvitacion(id) {
    return await Invitacion.delete(id);
}

/**
 * Validate code without redeeming
 */
async function validate(codigo) {
    const invitacion = await Invitacion.findByCodigo(codigo.toUpperCase());

    if (!invitacion) {
        return { valid: false, error: 'Código no encontrado' };
    }

    if (invitacion.estado === 'USADO') {
        return { valid: false, error: 'Este código ya fue utilizado' };
    }

    if (invitacion.estado === 'EXPIRADO' || new Date(invitacion.fecha_expiracion) < new Date()) {
        return { valid: false, error: 'Este código ha expirado' };
    }

    return {
        valid: true,
        equipo: invitacion.equipo,
        club: invitacion.club,
        rol: invitacion.rol,
        expira: invitacion.fecha_expiracion
    };
}

module.exports = {
    create,
    findByCodigo,
    findByEquipo,
    redeem,
    delete: deleteInvitacion,
    validate
};
