const usuarioService = require('../services/usuarioService');

/**
 * Controller: Usuario - handles HTTP request/response
 */

async function getAll(req, res, next) {
    // Security: Users cannot list all users in the system
    return res.status(403).json({
        error: 'Acceso denegado. Los usuarios no pueden listar todos los usuarios del sistema.'
    });
}

async function getById(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de usuario inválido' });
        }

        const usuario = await usuarioService.getById(id);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(usuario);
    } catch (error) {
        next(error);
    }
}

async function create(req, res, next) {
    try {
        const { correo, apellido, nombre, password } = req.body;

        if (!correo || !correo.includes('@')) {
            return res.status(400).json({ error: 'Correo inválido' });
        }
        if (!apellido || apellido.trim() === '') {
            return res.status(400).json({ error: 'El apellido es requerido' });
        }
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre es requerido' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const usuario = await usuarioService.create({ correo, apellido, nombre, password });
        res.status(201).json(usuario);
    } catch (error) {
        next(error);
    }
}

async function update(req, res, next) {
    try {
        const { id } = req.params;
        const { correo, apellido, nombre } = req.body;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de usuario inválido' });
        }

        if (correo && !correo.includes('@')) {
            return res.status(400).json({ error: 'Correo inválido' });
        }

        const usuario = await usuarioService.update(id, { correo, apellido, nombre });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(usuario);
    } catch (error) {
        next(error);
    }
}

async function updatePassword(req, res, next) {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de usuario inválido' });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const updated = await usuarioService.updatePassword(id, password);

        if (!updated) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        next(error);
    }
}

async function deleteUsuario(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de usuario inválido' });
        }

        const deleted = await usuarioService.delete(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        next(error);
    }
}

function isValidUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    updatePassword,
    delete: deleteUsuario
};
