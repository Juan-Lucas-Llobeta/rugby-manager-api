const { pool } = require('../config/database');

/**
 * Model: Entity attributes + methods that call Stored Procedures
 * 
 * Table: Equipos
 * - id_equipo: CHAR(36) PRIMARY KEY
 * - equipo: VARCHAR(100) NOT NULL
 * - club: VARCHAR(100)
 * - temporada_id: INT
 */

class Equipo {
    constructor(data) {
        this.id_equipo = data.id_equipo;
        this.equipo = data.equipo;
        this.club = data.club;
        this.temporada_id = data.temporada_id;
    }

    /**
     * Get all equipos
     * @returns {Promise<Equipo[]>}
     */
    static async findAll() {
        const [rows] = await pool.execute('CALL sp_equipos_get_all()');
        // First element of rows is the result set from the SP
        return rows[0].map(row => new Equipo(row));
    }

    /**
     * Get equipo by ID
     * @param {string} id - UUID of the equipo
     * @returns {Promise<Equipo|null>}
     */
    static async findById(id) {
        const [rows] = await pool.execute('CALL sp_equipos_get_by_id(?)', [id]);

        if (rows[0].length === 0) {
            return null;
        }

        return new Equipo(rows[0][0]);
    }

    /**
     * Create new equipo
     * @param {Object} data - Equipo data
     * @returns {Promise<Equipo>}
     */
    static async create(data) {
        const [rows] = await pool.execute(
            'CALL sp_equipos_create(?, ?, ?, ?)',
            [data.id_equipo, data.equipo, data.club, data.temporada_id]
        );

        return new Equipo(rows[0][0]);
    }

    /**
     * Update equipo
     * @param {string} id - UUID of the equipo
     * @param {Object} data - Updated data
     * @returns {Promise<Equipo>}
     */
    static async update(id, data) {
        const [rows] = await pool.execute(
            'CALL sp_equipos_update(?, ?, ?, ?)',
            [id, data.equipo, data.club, data.temporada_id]
        );

        return new Equipo(rows[0][0]);
    }

    /**
     * Delete equipo
     * @param {string} id - UUID of the equipo
     * @returns {Promise<boolean>}
     */
    /**
     * Delete equipo
     * @param {string} id - UUID of the equipo
     * @returns {Promise<boolean>}
     */
    static async delete(id) {
        const [rows] = await pool.execute('CALL sp_equipos_delete(?)', [id]);
        // rows[0] is the result set array, rows[0][0] is the first row
        const result = rows[0] && rows[0][0];
        return result && result.affected_rows > 0;
    }

    /**
     * Get team statistics
     * @param {string} id - UUID of the equipo
     * @returns {Promise<Object>}
     */
    static async getStats(id) {
        const [rows] = await pool.execute('CALL sp_equipo_stats_by_id(?)', [id]);
        return rows[0][0];
    }
}

module.exports = Equipo;
