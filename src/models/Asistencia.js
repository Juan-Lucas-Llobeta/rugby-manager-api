const { pool } = require('../config/database');

/**
 * Model: Asistencia
 * 
 * Table: Asistencias
 * - id_asistencia: CHAR(36) PRIMARY KEY
 * - id_entrenamiento: CHAR(36) NOT NULL FK
 * - id_jugador: CHAR(36) NOT NULL FK
 * - estado: ENUM('PRESENTE', 'AUSENTE', 'JUSTIFICADO')
 * - motivo_ausencia: TEXT
 * - hora_llegada: TIME
 */

class Asistencia {
    constructor(data) {
        this.id_asistencia = data.id_asistencia;
        this.id_entrenamiento = data.id_entrenamiento;
        this.id_jugador = data.id_jugador;
        this.estado = data.estado;
        this.motivo_ausencia = data.motivo_ausencia;
        this.hora_llegada = data.hora_llegada;
        // Joined fields from Jugador
        this.nombre = data.nombre;
        this.apellido = data.apellido;
        this.apodo = data.apodo;
        this.posicion_principal = data.posicion_principal;
        // Joined fields from Entrenamiento
        this.fecha_hora = data.fecha_hora;
        this.enfoque = data.enfoque;
        this.ubicacion = data.ubicacion;
    }

    static async findAll() {
        const [rows] = await pool.execute('CALL sp_asistencias_get_all()');
        return rows[0].map(row => new Asistencia(row));
    }

    static async findById(id) {
        const [rows] = await pool.execute('CALL sp_asistencias_get_by_id(?)', [id]);
        if (rows[0].length === 0) return null;
        return new Asistencia(rows[0][0]);
    }

    static async findByEntrenamiento(idEntrenamiento) {
        const [rows] = await pool.execute('CALL sp_asistencias_get_by_entrenamiento(?)', [idEntrenamiento]);
        return rows[0].map(row => new Asistencia(row));
    }

    static async findByJugador(idJugador) {
        const [rows] = await pool.execute('CALL sp_asistencias_get_by_jugador(?)', [idJugador]);
        return rows[0].map(row => new Asistencia(row));
    }

    static async getStatsByJugador(idJugador) {
        const [rows] = await pool.execute('CALL sp_asistencias_stats_by_jugador(?)', [idJugador]);
        return rows[0];
    }

    static async create(data) {
        const [rows] = await pool.execute(
            'CALL sp_asistencias_create(?, ?, ?, ?, ?, ?)',
            [
                data.id_asistencia,
                data.id_entrenamiento,
                data.id_jugador,
                data.estado,
                data.motivo_ausencia,
                data.hora_llegada
            ]
        );
        return new Asistencia(rows[0][0]);
    }

    static async update(id, data) {
        const [rows] = await pool.execute(
            'CALL sp_asistencias_update(?, ?, ?, ?)',
            [id, data.estado, data.motivo_ausencia, data.hora_llegada]
        );
        return new Asistencia(rows[0][0]);
    }

    static async delete(id) {
        const [rows] = await pool.execute('CALL sp_asistencias_delete(?)', [id]);
        const result = rows[0] && rows[0][0];
        return result && result.affected_rows > 0;
    }

    static async bulkCreate(idEntrenamiento, defaultEstado) {
        const [rows] = await pool.execute('CALL sp_asistencias_bulk_create(?, ?)', [idEntrenamiento, defaultEstado]);
        return rows[0].map(row => new Asistencia(row));
    }
}

module.exports = Asistencia;
