const { pool } = require('../config/database');

/**
 * Model: Entrenamiento
 * 
 * Table: Entrenamientos
 * - id_entrenamiento: CHAR(36) PRIMARY KEY
 * - id_equipo: CHAR(36) NOT NULL FK
 * - fecha_hora: DATETIME NOT NULL
 * - enfoque: VARCHAR(200)
 * - ubicacion: VARCHAR(100)
 * - duracion_minutos: INT
 * - estado: ENUM('PROGRAMADO', 'REALIZADO', 'CANCELADO')
 * - notas: TEXT
 */

class Entrenamiento {
    constructor(data) {
        this.id_entrenamiento = data.id_entrenamiento;
        this.id_equipo = data.id_equipo;
        this.fecha_hora = data.fecha_hora;
        this.enfoque = data.enfoque;
        this.ubicacion = data.ubicacion;
        this.duracion_minutos = data.duracion_minutos;
        this.estado = data.estado;
        this.notas = data.notas;
        // Joined fields
        this.nombre_equipo = data.nombre_equipo;
    }

    static async findAll() {
        const [rows] = await pool.execute('CALL sp_entrenamientos_get_all()');
        return rows[0].map(row => new Entrenamiento(row));
    }

    static async findById(id) {
        const [rows] = await pool.execute('CALL sp_entrenamientos_get_by_id(?)', [id]);
        if (rows[0].length === 0) return null;
        return new Entrenamiento(rows[0][0]);
    }

    static async findByEquipo(idEquipo) {
        const [rows] = await pool.execute('CALL sp_entrenamientos_get_by_equipo(?)', [idEquipo]);
        return rows[0].map(row => new Entrenamiento(row));
    }

    static async findByEquipoAndEstado(idEquipo, estado) {
        const [rows] = await pool.execute('CALL sp_entrenamientos_get_by_equipo_estado(?, ?)', [idEquipo, estado]);
        return rows[0].map(row => new Entrenamiento(row));
    }

    static async findUpcoming(idEquipo, limit = 5) {
        const [rows] = await pool.execute('CALL sp_entrenamientos_get_upcoming(?, ?)', [idEquipo, limit]);
        return rows[0].map(row => new Entrenamiento(row));
    }

    static async create(data) {
        const [rows] = await pool.execute(
            'CALL sp_entrenamientos_create(?, ?, ?, ?, ?, ?, ?, ?)',
            [
                data.id_entrenamiento,
                data.id_equipo,
                data.fecha_hora,
                data.enfoque,
                data.ubicacion,
                data.duracion_minutos,
                data.estado || 'PROGRAMADO',
                data.notas
            ]
        );
        return new Entrenamiento(rows[0][0]);
    }

    static async update(id, data) {
        const [rows] = await pool.execute(
            'CALL sp_entrenamientos_update(?, ?, ?, ?, ?, ?, ?)',
            [
                id,
                data.fecha_hora,
                data.enfoque,
                data.ubicacion,
                data.duracion_minutos,
                data.estado,
                data.notas
            ]
        );
        return new Entrenamiento(rows[0][0]);
    }

    static async updateEstado(id, estado) {
        const [rows] = await pool.execute('CALL sp_entrenamientos_update_estado(?, ?)', [id, estado]);
        return new Entrenamiento(rows[0][0]);
    }

    static async delete(id) {
        const [rows] = await pool.execute('CALL sp_entrenamientos_delete(?)', [id]);
        const result = rows[0] && rows[0][0];
        return result && result.affected_rows > 0;
    }
}

module.exports = Entrenamiento;
