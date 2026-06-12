const { pool } = require('../config/database');

/**
 * Model: Torneo
 * 
 * Table: Torneos
 * - id_torneo: CHAR(36) PRIMARY KEY
 * - torneo: VARCHAR(100) NOT NULL
 * - temporada_id: INT
 */

class Torneo {
    constructor(data) {
        this.id_torneo = data.id_torneo;
        this.torneo = data.torneo;
        this.temporada_id = data.temporada_id;
        this.id_equipo = data.id_equipo;
    }

    static async findAll() {
        const [rows] = await pool.execute('CALL sp_torneos_get_all()');
        return rows[0].map(row => new Torneo(row));
    }

    static async findById(id) {
        const [rows] = await pool.execute('CALL sp_torneos_get_by_id(?)', [id]);
        if (rows[0].length === 0) return null;
        return new Torneo(rows[0][0]);
    }

    static async findByTemporada(temporadaId) {
        const [rows] = await pool.execute('CALL sp_torneos_get_by_temporada(?)', [temporadaId]);
        return rows[0].map(row => new Torneo(row));
    }

    static async findByEquipo(idEquipo) {
        const [rows] = await pool.execute('CALL sp_torneos_get_by_equipo(?)', [idEquipo]);
        return rows[0].map(row => new Torneo(row));
    }

    static async findByEquipoAndTemporada(idEquipo, temporadaId) {
        const [rows] = await pool.execute('CALL sp_torneos_get_by_equipo_and_temporada(?, ?)', [idEquipo, temporadaId]);
        return rows[0].map(row => new Torneo(row));
    }

    static async findByName(name, idEquipo = null) {
        // Direct SQL since SP might not exist or be easily updatable
        let query = 'SELECT * FROM Torneos WHERE torneo = ?';
        let params = [name];

        if (idEquipo) {
            query += ' AND id_equipo = ?';
            params.push(idEquipo);
        } else {
            query += ' AND id_equipo IS NULL';
        }

        const [rows] = await pool.execute(query, params);
        if (rows.length === 0) return null;
        return new Torneo(rows[0]);
    }

    static async create(data) {
        const [rows] = await pool.execute(
            'CALL sp_torneos_create(?, ?, ?, ?)',
            [data.id_torneo, data.torneo, data.temporada_id, data.id_equipo || null]
        );
        return new Torneo(rows[0][0]);
    }

    static async update(id, data) {
        const [rows] = await pool.execute(
            'CALL sp_torneos_update(?, ?, ?, ?)',
            [id, data.torneo, data.temporada_id, data.id_equipo || null]
        );
        return new Torneo(rows[0][0]);
    }

    static async delete(id) {
        const [rows] = await pool.execute('CALL sp_torneos_delete(?)', [id]);
        const result = rows[0] && rows[0][0];
        return result && result.affected_rows > 0;
    }

    /**
     * Get tournament statistics for a specific team
     * @param {string} idTorneo - Tournament ID
     * @param {string} idEquipo - Team ID
     * @returns {Object} Statistics object
     */
    static async getStatsByEquipo(idTorneo, idEquipo) {
        const [rows] = await pool.execute(
            'CALL sp_torneo_stats_by_equipo(?, ?)',
            [idTorneo, idEquipo]
        );
        // SP returns a single row with all stats
        return rows[0] && rows[0][0] ? rows[0][0] : {
            partidos: 0,
            ganados: 0,
            empatados: 0,
            perdidos: 0,
            puntos_favor: 0,
            puntos_contra: 0,
            diferencia: 0,
            tries: 0,
            conversiones: 0,
            penales: 0,
            drops: 0,
            tarjetas_amarillas: 0,
            tarjetas_rojas: 0
        };
    }
}

module.exports = Torneo;
