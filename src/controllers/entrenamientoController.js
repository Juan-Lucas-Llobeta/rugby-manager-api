const entrenamientoService = require('../services/entrenamientoService');

/**
 * Controller: Entrenamiento - handles HTTP request/response
 */

const VALID_ESTADOS = ['PROGRAMADO', 'REALIZADO', 'CANCELADO'];

async function getAll(req, res, next) {
    try {
        const { idEquipo, estado, upcoming, limit } = req.query;

        // Require team ID for security - prevent fetching all trainings
        if (!idEquipo || !isValidUUID(idEquipo)) {
            return res.status(400).json({
                error: 'idEquipo es requerido como parámetro de búsqueda'
            });
        }

        let entrenamientos;
        if (upcoming === 'true') {
            entrenamientos = await entrenamientoService.getUpcoming(idEquipo, parseInt(limit) || 5);
        } else if (estado && VALID_ESTADOS.includes(estado)) {
            entrenamientos = await entrenamientoService.getByEquipoAndEstado(idEquipo, estado);
        } else {
            entrenamientos = await entrenamientoService.getByEquipo(idEquipo);
        }

        res.json(entrenamientos);
    } catch (error) {
        next(error);
    }
}

async function getById(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de entrenamiento inválido' });
        }

        const entrenamiento = await entrenamientoService.getById(id);

        if (!entrenamiento) {
            return res.status(404).json({ error: 'Entrenamiento no encontrado' });
        }

        res.json(entrenamiento);
    } catch (error) {
        next(error);
    }
}

async function getByEquipo(req, res, next) {
    try {
        const { idEquipo } = req.params;
        const { estado, upcoming, limit } = req.query;

        if (!isValidUUID(idEquipo)) {
            return res.status(400).json({ error: 'ID de equipo inválido' });
        }

        let entrenamientos;
        if (upcoming === 'true') {
            entrenamientos = await entrenamientoService.getUpcoming(idEquipo, parseInt(limit) || 5);
        } else if (estado && VALID_ESTADOS.includes(estado)) {
            entrenamientos = await entrenamientoService.getByEquipoAndEstado(idEquipo, estado);
        } else {
            entrenamientos = await entrenamientoService.getByEquipo(idEquipo);
        }

        res.json(entrenamientos);
    } catch (error) {
        next(error);
    }
}

async function create(req, res, next) {
    try {
        const { id_equipo, fecha_hora, enfoque, ubicacion, duracion_minutos, estado, notas } = req.body;

        if (!id_equipo || !isValidUUID(id_equipo)) {
            return res.status(400).json({ error: 'ID de equipo inválido' });
        }
        if (!fecha_hora) {
            return res.status(400).json({ error: 'La fecha y hora son requeridas' });
        }
        if (estado && !VALID_ESTADOS.includes(estado)) {
            return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${VALID_ESTADOS.join(', ')}` });
        }

        const entrenamiento = await entrenamientoService.create({
            id_equipo, fecha_hora, enfoque, ubicacion, duracion_minutos, estado, notas
        });

        res.status(201).json(entrenamiento);
    } catch (error) {
        next(error);
    }
}

async function update(req, res, next) {
    try {
        const { id } = req.params;
        const { fecha_hora, enfoque, ubicacion, duracion_minutos, estado, notas } = req.body;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de entrenamiento inválido' });
        }
        if (estado && !VALID_ESTADOS.includes(estado)) {
            return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${VALID_ESTADOS.join(', ')}` });
        }

        const entrenamiento = await entrenamientoService.update(id, {
            fecha_hora, enfoque, ubicacion, duracion_minutos, estado, notas
        });

        if (!entrenamiento) {
            return res.status(404).json({ error: 'Entrenamiento no encontrado' });
        }

        res.json(entrenamiento);
    } catch (error) {
        next(error);
    }
}

async function updateEstado(req, res, next) {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de entrenamiento inválido' });
        }
        if (!estado || !VALID_ESTADOS.includes(estado)) {
            return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${VALID_ESTADOS.join(', ')}` });
        }

        const entrenamiento = await entrenamientoService.updateEstado(id, estado);

        if (!entrenamiento) {
            return res.status(404).json({ error: 'Entrenamiento no encontrado' });
        }

        res.json(entrenamiento);
    } catch (error) {
        next(error);
    }
}

async function deleteEntrenamiento(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de entrenamiento inválido' });
        }

        const deleted = await entrenamientoService.delete(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Entrenamiento no encontrado' });
        }

        res.json({ message: 'Entrenamiento eliminado exitosamente' });
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
    getByEquipo,
    create,
    update,
    updateEstado,
    delete: deleteEntrenamiento
};
