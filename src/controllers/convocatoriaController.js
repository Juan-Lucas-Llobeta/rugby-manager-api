const convocatoriaService = require('../services/convocatoriaService');

/**
 * Controller: Convocatoria - handles HTTP request/response
 */

const VALID_TIPOS = ['TITULAR', 'SUPLENTE'];

async function getAll(req, res, next) {
    try {
        const convocatorias = await convocatoriaService.getAll();
        res.json(convocatorias);
    } catch (error) {
        next(error);
    }
}

async function getById(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de convocatoria inválido' });
        }

        const convocatoria = await convocatoriaService.getById(id);

        if (!convocatoria) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }

        res.json(convocatoria);
    } catch (error) {
        next(error);
    }
}

async function getByPartido(req, res, next) {
    try {
        const { idPartido } = req.params;
        const { tipo } = req.query;

        if (!isValidUUID(idPartido)) {
            return res.status(400).json({ error: 'ID de partido inválido' });
        }

        let convocatorias;
        if (tipo === 'TITULAR') {
            convocatorias = await convocatoriaService.getTitulares(idPartido);
        } else if (tipo === 'SUPLENTE') {
            convocatorias = await convocatoriaService.getSuplentes(idPartido);
        } else {
            convocatorias = await convocatoriaService.getByPartido(idPartido);
        }

        res.json(convocatorias);
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

        const convocatorias = await convocatoriaService.getByJugador(idJugador);
        res.json(convocatorias);
    } catch (error) {
        next(error);
    }
}

async function create(req, res, next) {
    try {
        const { id_partido, id_jugador, tipo, posicion, numero_camiseta } = req.body;

        if (!id_partido || !isValidUUID(id_partido)) {
            return res.status(400).json({ error: 'ID de partido inválido' });
        }
        if (!id_jugador || !isValidUUID(id_jugador)) {
            return res.status(400).json({ error: 'ID de jugador inválido' });
        }
        if (!tipo || !VALID_TIPOS.includes(tipo)) {
            return res.status(400).json({ error: `Tipo inválido. Valores permitidos: ${VALID_TIPOS.join(', ')}` });
        }
        if (!posicion || posicion.trim() === '') {
            return res.status(400).json({ error: 'La posición es requerida' });
        }

        const convocatoria = await convocatoriaService.create({
            id_partido, id_jugador, tipo, posicion, numero_camiseta
        });

        res.status(201).json(convocatoria);
    } catch (error) {
        next(error);
    }
}

async function update(req, res, next) {
    try {
        const { id } = req.params;
        const { tipo, posicion, numero_camiseta } = req.body;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de convocatoria inválido' });
        }
        if (tipo && !VALID_TIPOS.includes(tipo)) {
            return res.status(400).json({ error: `Tipo inválido. Valores permitidos: ${VALID_TIPOS.join(', ')}` });
        }

        const convocatoria = await convocatoriaService.update(id, {
            tipo, posicion, numero_camiseta
        });

        if (!convocatoria) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }

        res.json(convocatoria);
    } catch (error) {
        next(error);
    }
}

async function deleteConvocatoria(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'ID de convocatoria inválido' });
        }

        const deleted = await convocatoriaService.delete(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }

        res.json({ message: 'Convocatoria eliminada exitosamente' });
    } catch (error) {
        next(error);
    }
}

async function deleteByPartido(req, res, next) {
    try {
        const { idPartido } = req.params;

        if (!isValidUUID(idPartido)) {
            return res.status(400).json({ error: 'ID de partido inválido' });
        }

        const deleted = await convocatoriaService.deleteByPartido(idPartido);

        if (!deleted) {
            return res.status(404).json({ error: 'Partido no encontrado' });
        }

        res.json({ message: 'Convocatorias del partido eliminadas exitosamente' });
    } catch (error) {
        next(error);
    }
}

/**
 * Batch update minutes played for all players in a match
 * Body: { playersMinutes: [{ id_jugador, minutos }] }
 */
async function updateMinutosByPartido(req, res, next) {
    try {
        const { idPartido } = req.params;
        const { playersMinutes } = req.body;

        if (!isValidUUID(idPartido)) {
            return res.status(400).json({ error: 'ID de partido inválido' });
        }

        if (!Array.isArray(playersMinutes) || playersMinutes.length === 0) {
            return res.status(400).json({ error: 'playersMinutes debe ser un array con al menos un elemento' });
        }

        // Validate each entry
        for (const pm of playersMinutes) {
            if (!pm.id_jugador || !isValidUUID(pm.id_jugador)) {
                return res.status(400).json({ error: 'ID de jugador inválido en playersMinutes' });
            }
            if (typeof pm.minutos !== 'number' || pm.minutos < 0) {
                return res.status(400).json({ error: 'minutos debe ser un número no negativo' });
            }
        }

        await convocatoriaService.updateMinutosByPartido(idPartido, playersMinutes);
        res.json({ message: 'Minutos actualizados exitosamente' });
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
    getByPartido,
    getByJugador,
    create,
    update,
    delete: deleteConvocatoria,
    deleteByPartido,
    updateMinutosByPartido
};
