const { pool } = require('../config/database');

/**
 * Model: EventoPartido
 * 
 * Base table for all match events. Uses inheritance pattern:
 * - EventosPuntaje (scoring events: TRY, CONVERSION, etc.)
 * - EventosFormacion (formation events: SCRUM, LINEOUT, cards)
 */

class EventoPartido {
    constructor(data) {
        this.id_evento = data.id_evento;
        this.id_partido = data.id_partido;
        this.minuto = data.minuto;
        this.es_propio = data.es_propio;
        this.categoria = data.categoria; // PUNTAJE or FORMACION
        this.periodo = data.periodo;     // Period number (1, 2, 3, etc.)
        this.created_at = data.created_at; // Timestamp for ordering
        // Scoring event fields
        this.tipo = data.tipo || data.tipo_puntaje || data.tipo_formacion;
        this.id_jugador = data.id_jugador;
        this.nombre = data.nombre;
        this.apellido = data.apellido;
        this.apodo = data.apodo;
        // Formation event fields
        this.resultado = data.resultado;
    }

    static async findByPartido(idPartido) {
        const [rows] = await pool.execute('CALL sp_eventos_get_by_partido(?)', [idPartido]);
        return rows[0].map(row => new EventoPartido(row));
    }

    static async findById(id) {
        const [rows] = await pool.execute('CALL sp_eventos_get_by_id(?)', [id]);
        if (rows[0].length === 0) return null;
        return new EventoPartido(rows[0][0]);
    }

    static async delete(id) {
        const [rows] = await pool.execute('CALL sp_eventos_delete(?)', [id]);
        const result = rows[0] && rows[0][0];
        return result && result.affected_rows > 0;
    }
}

/**
 * Model: EventoPuntaje
 * Scoring events: TRY, CONVERSION, PENAL, DROP_GOAL, TRY_PENAL
 */
class EventoPuntaje extends EventoPartido {
    static async findByPartido(idPartido) {
        const [rows] = await pool.execute('CALL sp_eventos_puntaje_get_by_partido(?)', [idPartido]);
        return rows[0].map(row => new EventoPuntaje(row));
    }

    static async create(data) {
        const [rows] = await pool.execute(
            'CALL sp_eventos_puntaje_create(?, ?, ?, ?, ?, ?, ?)',
            [
                data.id_evento,
                data.id_partido,
                data.minuto,
                data.es_propio,
                data.tipo,
                data.id_jugador,
                data.periodo || 1
            ]
        );
        return new EventoPuntaje(rows[0][0]);
    }

    static async update(id, data) {
        const [rows] = await pool.execute(
            'CALL sp_eventos_puntaje_update(?, ?, ?, ?, ?)',
            [id, data.minuto, data.es_propio, data.tipo, data.id_jugador]
        );
        return new EventoPuntaje(rows[0][0]);
    }

    static async getStatsByJugador(idJugador) {
        const [rows] = await pool.execute('CALL sp_eventos_puntaje_stats_by_jugador(?)', [idJugador]);
        return rows[0];
    }
}

/**
 * Model: EventoFormacion
 * Formation events: SCRUM, LINEOUT, RED_CARD, YELLOW_CARD
 */
class EventoFormacion extends EventoPartido {
    static async findByPartido(idPartido) {
        const [rows] = await pool.execute('CALL sp_eventos_formacion_get_by_partido(?)', [idPartido]);
        return rows[0].map(row => new EventoFormacion(row));
    }

    static async create(data) {
        const [rows] = await pool.execute(
            'CALL sp_eventos_formacion_create(?, ?, ?, ?, ?, ?, ?, ?)',
            [
                data.id_evento,
                data.id_partido,
                data.minuto,
                data.es_propio,
                data.tipo,
                data.resultado,
                data.id_jugador,
                data.periodo || 1
            ]
        );
        return new EventoFormacion(rows[0][0]);
    }

    static async update(id, data) {
        const [rows] = await pool.execute(
            'CALL sp_eventos_formacion_update(?, ?, ?, ?, ?)',
            [id, data.minuto, data.es_propio, data.tipo, data.resultado]
        );
        return new EventoFormacion(rows[0][0]);
    }

    static async getStatsByPartido(idPartido) {
        const [rows] = await pool.execute('CALL sp_eventos_formacion_stats_by_partido(?)', [idPartido]);
        return rows[0];
    }
}

module.exports = { EventoPartido, EventoPuntaje, EventoFormacion };
