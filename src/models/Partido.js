const { pool } = require('../config/database');

/**
 * Model: Partido
 * 
 * Table: Partidos
 * - id_partido: CHAR(36) PRIMARY KEY
 * - id_equipo: CHAR(36) NOT NULL FK
 * - id_torneo: CHAR(36) FK (nullable)
 * - rival: VARCHAR(100) NOT NULL
 * - condicion: ENUM('LOCAL', 'VISITANTE')
 * - fecha_hora: DATETIME NOT NULL
 * - marcador_propio: INT DEFAULT 0
 * - marcador_rival: INT DEFAULT 0
 * - estado: ENUM('PROGRAMADO', 'EN_JUEGO', 'JUGADO')
 */

class Partido {
    constructor(data) {
        this.id_partido = data.id_partido;
        this.id_equipo = data.id_equipo;
        this.id_torneo = data.id_torneo;
        this.rival = data.rival;
        this.condicion = data.condicion;
        this.fecha_hora = data.fecha_hora;
        this.marcador_propio = data.marcador_propio;
        this.marcador_rival = data.marcador_rival;
        this.estado = data.estado;
        // Joined fields
        this.nombre_torneo = data.nombre_torneo;
        this.nombre_equipo = data.nombre_equipo;
    }

    static async findAll() {
        const [rows] = await pool.execute('CALL sp_partidos_get_all()');
        return rows[0].map(row => new Partido(row));
    }

    static async findById(id) {
        const [rows] = await pool.execute('CALL sp_partidos_get_by_id(?)', [id]);
        if (rows[0].length === 0) return null;
        return new Partido(rows[0][0]);
    }

    static async findByEquipo(idEquipo) {
        const [rows] = await pool.execute('CALL sp_partidos_get_by_equipo(?)', [idEquipo]);
        return rows[0].map(row => new Partido(row));
    }

    static async findByEquipoAndEstado(idEquipo, estado) {
        const [rows] = await pool.execute('CALL sp_partidos_get_by_equipo_estado(?, ?)', [idEquipo, estado]);
        return rows[0].map(row => new Partido(row));
    }

    static async findUpcoming(idEquipo, limit = 5) {
        const [rows] = await pool.execute('CALL sp_partidos_get_upcoming(?, ?)', [idEquipo, limit]);
        return rows[0].map(row => new Partido(row));
    }

    static async create(data) {
        const [rows] = await pool.execute(
            'CALL sp_partidos_create(?, ?, ?, ?, ?, ?, ?)',
            [
                data.id_partido,
                data.id_equipo,
                data.id_torneo,
                data.rival,
                data.condicion,
                data.fecha_hora,
                data.estado || 'PROGRAMADO'
            ]
        );
        return new Partido(rows[0][0]);
    }

    static async update(id, data) {
        const [rows] = await pool.execute(
            'CALL sp_partidos_update(?, ?, ?, ?, ?, ?, ?, ?)',
            [
                id,
                data.id_torneo,
                data.rival,
                data.condicion,
                data.fecha_hora,
                data.marcador_propio,
                data.marcador_rival,
                data.estado
            ]
        );
        return new Partido(rows[0][0]);
    }

    static async updateMarcador(id, marcadorPropio, marcadorRival) {
        const [rows] = await pool.execute(
            'CALL sp_partidos_update_marcador(?, ?, ?)',
            [id, marcadorPropio, marcadorRival]
        );
        return new Partido(rows[0][0]);
    }

    static async updateEstado(id, estado) {
        const [rows] = await pool.execute('CALL sp_partidos_update_estado(?, ?)', [id, estado]);
        return new Partido(rows[0][0]);
    }

    static async delete(id) {
        const [rows] = await pool.execute('CALL sp_partidos_delete(?)', [id]);
        const result = rows[0] && rows[0][0];
        return result && result.affected_rows > 0;
    }
}

module.exports = Partido;
