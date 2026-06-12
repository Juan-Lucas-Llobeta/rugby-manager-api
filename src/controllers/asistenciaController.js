const asistenciaService = require('../services/asistenciaService');

/**
 * Controller: Asistencia - handles HTTP request/response
 */

const VALID_ESTADOS = ['PRESENTE', 'AUSENTE', 'JUSTIFICADO'];

async function getAll(req, res, next) {
    try {
        const asistencias = await asistenciaService.getAll();
        res.json(asistencias);
    } catch (error) {
        next(error);
    }
}

async function getById(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de asistencia inválido' });
        }

        const asistencia = await asistenciaService.getById(id);

        if (!asistencia) {
            return res.status(404).json({ error: 'Asistencia no encontrada' });
        }

        res.json(asistencia);
    } catch (error) {
        next(error);
    }
}

async function getByEntrenamiento(req, res, next) {
    try {
        const { idEntrenamiento } = req.params;

        if (!isValidUUID(idEntrenamiento)) {
            return res.status(400).json({ error: 'ID de entrenamiento inválido' });
        }

        const asistencias = await asistenciaService.getByEntrenamiento(idEntrenamiento);
        res.json(asistencias);
    } catch (error) {
        next(error);
    }
}

async function getByJugador(req, res, next) {
    try {
        const { idJugador } = req.params;

        if (!isValidUUID(idJugador)) {
            return res.status(400).json({ error: 'ID de jugador inválido' });
        }

        const asistencias = await asistenciaService.getByJugador(idJugador);
        res.json(asistencias);
    } catch (error) {
        next(error);
    }
}

async function getStatsByJugador(req, res, next) {
    try {
        const { idJugador } = req.params;

        if (!isValidUUID(idJugador)) {
            return res.status(400).json({ error: 'ID de jugador inválido' });
        }

        const stats = await asistenciaService.getStatsByJugador(idJugador);
        res.json(stats);
    } catch (error) {
        next(error);
    }
}

async function create(req, res, next) {
    try {
        const { id_entrenamiento, id_jugador, estado, motivo_ausencia, hora_llegada } = req.body;

        if (!id_entrenamiento || !isValidUUID(id_entrenamiento)) {
            return res.status(400).json({ error: 'ID de entrenamiento inválido' });
        }
        if (!id_jugador || !isValidUUID(id_jugador)) {
            return res.status(400).json({ error: 'ID de jugador inválido' });
        }
        if (!estado || !VALID_ESTADOS.includes(estado)) {
            return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${VALID_ESTADOS.join(', ')}` });
        }

        const asistencia = await asistenciaService.create({
            id_entrenamiento, id_jugador, estado, motivo_ausencia, hora_llegada
        });

        res.status(201).json(asistencia);
    } catch (error) {
        next(error);
    }
}

async function update(req, res, next) {
    try {
        const { id } = req.params;
        const { estado, motivo_ausencia, hora_llegada } = req.body;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de asistencia inválido' });
        }
        if (estado && !VALID_ESTADOS.includes(estado)) {
            return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${VALID_ESTADOS.join(', ')}` });
        }

        const asistencia = await asistenciaService.update(id, {
            estado, motivo_ausencia, hora_llegada
        });

        if (!asistencia) {
            return res.status(404).json({ error: 'Asistencia no encontrada' });
        }

        res.json(asistencia);
    } catch (error) {
        next(error);
    }
}

async function deleteAsistencia(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de asistencia inválido' });
        }

        const deleted = await asistenciaService.delete(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Asistencia no encontrada' });
        }

        res.json({ message: 'Asistencia eliminada exitosamente' });
    } catch (error) {
        next(error);
    }
}

async function bulkCreate(req, res, next) {
    try {
        const { idEntrenamiento } = req.params;
        const { default_estado } = req.body;

        if (!isValidUUID(idEntrenamiento)) {
            return res.status(400).json({ error: 'ID de entrenamiento inválido' });
        }

        const estado = default_estado && VALID_ESTADOS.includes(default_estado) ? default_estado : 'AUSENTE';
        const asistencias = await asistenciaService.bulkCreate(idEntrenamiento, estado);
        res.status(201).json(asistencias);
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
    getByEntrenamiento,
    getByJugador,
    getStatsByJugador,
    create,
    update,
    delete: deleteAsistencia,
    bulkCreate
};
