const Partido = require('../models/Partido');
const Entrenamiento = require('../models/Entrenamiento');

/**
 * Controller: Calendar - combines matches and trainings for calendar view
 */

// Color scheme for events
const COLORS = {
    PARTIDO_LOCAL: '#3B82F6',      // Blue
    PARTIDO_LOCAL_PLAYED: '#1E40AF',
    PARTIDO_VISITANTE: '#8B5CF6',  // Purple
    PARTIDO_VISITANTE_PLAYED: '#5B21B6',
    ENTRENAMIENTO: '#10B981',      // Green
    ENTRENAMIENTO_CANCELLED: '#EF4444'  // Red
};

/**
 * Get calendar events for a team within a date range
 * GET /api/calendar/equipo/:idEquipo?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
 */
async function getByEquipo(req, res, next) {
    try {
        const { idEquipo } = req.params;
        const { desde, hasta } = req.query;

        if (!isValidUUID(idEquipo)) {
            return res.status(400).json({ error: 'ID de equipo inválido' });
        }

        // Default to current month if no dates provided
        const now = new Date();
        const startDate = desde || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const endDate = hasta || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        // Fetch matches and trainings in parallel
        const [partidos, entrenamientos] = await Promise.all([
            Partido.findByEquipo(idEquipo),
            Entrenamiento.findByEquipo(idEquipo)
        ]);

        // Filter by date range and transform to calendar events
        const events = [];

        // Process matches
        for (const partido of partidos) {
            const matchDate = new Date(partido.fecha_hora);
            const startDateObj = new Date(startDate);
            const endDateObj = new Date(endDate);
            endDateObj.setHours(23, 59, 59);

            if (matchDate >= startDateObj && matchDate <= endDateObj) {
                const isLocal = partido.condicion === 'LOCAL';
                const isPlayed = partido.estado === 'JUGADO';

                let color;
                if (isLocal) {
                    color = isPlayed ? COLORS.PARTIDO_LOCAL_PLAYED : COLORS.PARTIDO_LOCAL;
                } else {
                    color = isPlayed ? COLORS.PARTIDO_VISITANTE_PLAYED : COLORS.PARTIDO_VISITANTE;
                }

                // Estimate match duration: 80 minutes + 20 min halftime = ~100 min
                const endTime = new Date(matchDate.getTime() + 100 * 60 * 1000);

                events.push({
                    id: partido.id_partido,
                    type: 'PARTIDO',
                    title: `${isLocal ? 'vs' : '@'} ${partido.rival}`,
                    start: partido.fecha_hora,
                    end: endTime.toISOString(),
                    color,
                    allDay: false,
                    data: {
                        id_partido: partido.id_partido,
                        rival: partido.rival,
                        condicion: partido.condicion,
                        estado: partido.estado,
                        marcador_propio: partido.marcador_propio,
                        marcador_rival: partido.marcador_rival,
                        torneo: partido.torneo
                    }
                });
            }
        }

        // Process trainings
        for (const entrenamiento of entrenamientos) {
            const trainDate = new Date(entrenamiento.fecha_hora);
            const startDateObj = new Date(startDate);
            const endDateObj = new Date(endDate);
            endDateObj.setHours(23, 59, 59);

            if (trainDate >= startDateObj && trainDate <= endDateObj) {
                const isCancelled = entrenamiento.estado === 'CANCELADO';
                const color = isCancelled ? COLORS.ENTRENAMIENTO_CANCELLED : COLORS.ENTRENAMIENTO;

                // Use duration from training or default to 90 minutes
                const durationMinutes = entrenamiento.duracion || 90;
                const endTime = new Date(trainDate.getTime() + durationMinutes * 60 * 1000);

                events.push({
                    id: entrenamiento.id_entrenamiento,
                    type: 'ENTRENAMIENTO',
                    title: entrenamiento.titulo || 'Entrenamiento',
                    start: entrenamiento.fecha_hora,
                    end: endTime.toISOString(),
                    color,
                    allDay: false,
                    data: {
                        id_entrenamiento: entrenamiento.id_entrenamiento,
                        lugar: entrenamiento.lugar,
                        estado: entrenamiento.estado,
                        notas: entrenamiento.notas
                    }
                });
            }
        }

        // Sort by start date
        events.sort((a, b) => new Date(a.start) - new Date(b.start));

        res.json({
            desde: startDate,
            hasta: endDate,
            total: events.length,
            events
        });
    } catch (error) {
        next(error);
    }
}

function isValidUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

module.exports = {
    getByEquipo
};
