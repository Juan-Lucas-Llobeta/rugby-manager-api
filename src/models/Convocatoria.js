const { pool } = require('../config/database');

/**
 * Model: Convocatoria
 * 
 * Table: Convocatorias
 * - id_convocatoria: CHAR(36) PRIMARY KEY
 * - id_partido: CHAR(36) NOT NULL FK
 * - id_jugador: CHAR(36) NOT NULL FK
 * - tipo: ENUM('TITULAR', 'SUPLENTE')
 * - posicion: VARCHAR(50) NOT NULL
 * - numero_camiseta: INT
 */

class Convocatoria {
    constructor(data) {
        this.id_convocatoria = data.id_convocatoria;
        this.id_partido = data.id_partido;
        this.id_jugador = data.id_jugador;
        this.tipo = data.tipo;
        this.posicion = data.posicion;
        this.numero_camiseta = data.numero_camiseta;
        // Joined fields from Jugador
        this.nombre = data.nombre;
        this.apellido = data.apellido;
        this.apodo = data.apodo;
        this.posicion_principal = data.posicion_principal;
        // Joined fields from Partido (when querying by jugador)
        this.rival = data.rival;
        this.fecha_hora = data.fecha_hora;
        this.condicion = data.condicion;
    }

    static async findAll() {
        const [rows] = await pool.execute('CALL sp_convocatorias_get_all()');
        return rows[0].map(row => new Convocatoria(row));
    }

    static async findById(id) {
        const [rows] = await pool.execute('CALL sp_convocatorias_get_by_id(?)', [id]);
        if (rows[0].length === 0) return null;
        return new Convocatoria(rows[0][0]);
    }

    static async findByPartido(idPartido) {
        const [rows] = await pool.execute('CALL sp_convocatorias_get_by_partido(?)', [idPartido]);
        return rows[0].map(row => new Convocatoria(row));
    }

    static async findTitulares(idPartido) {
        const [rows] = await pool.execute('CALL sp_convocatorias_get_titulares(?)', [idPartido]);
        return rows[0].map(row => new Convocatoria(row));
    }

    static async findSuplentes(idPartido) {
        const [rows] = await pool.execute('CALL sp_convocatorias_get_suplentes(?)', [idPartido]);
        return rows[0].map(row => new Convocatoria(row));
    }

    static async findByJugador(idJugador) {
        const [rows] = await pool.execute('CALL sp_convocatorias_get_by_jugador(?)', [idJugador]);
        return rows[0].map(row => new Convocatoria(row));
    }

    static async create(data) {
        const [rows] = await pool.execute(
            'CALL sp_convocatorias_create(?, ?, ?, ?, ?, ?)',
            [
                data.id_convocatoria,
                data.id_partido,
                data.id_jugador,
                data.tipo,
                data.posicion,
                data.numero_camiseta
            ]
        );
        return new Convocatoria(rows[0][0]);
    }

    static async update(id, data) {
        const [rows] = await pool.execute(
            'CALL sp_convocatorias_update(?, ?, ?, ?)',
            [id, data.tipo, data.posicion, data.numero_camiseta]
        );
        return new Convocatoria(rows[0][0]);
    }

    static async delete(id) {
        const [rows] = await pool.execute('CALL sp_convocatorias_delete(?)', [id]);
        const result = rows[0] && rows[0][0];
        return result && result.affected_rows > 0;
    }

    static async deleteByPartido(idPartido) {
        const [rows] = await pool.execute('CALL sp_convocatorias_delete_by_partido(?)', [idPartido]);
        const result = rows[0] && rows[0][0];
        return result && result.affected_rows > 0;
    }

    /**
     * Update minutos_jugados for a specific convocatoria
     */
    static async updateMinutosJugados(idConvocatoria, minutos) {
        await pool.execute(
            'UPDATE Convocatorias SET minutos_jugados = ? WHERE id_convocatoria = ?',
            [minutos, idConvocatoria]
        );
    }

    /**
     * Batch update minutos_jugados for multiple players in a match
     * @param {Object[]} playersMinutes - Array of { id_jugador, minutos }
     * @param {string} idPartido - Match ID
     */
    static async updateMinutosByPartido(idPartido, playersMinutes) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            for (const pm of playersMinutes) {
                await connection.execute(
                    'UPDATE Convocatorias SET minutos_jugados = ? WHERE id_partido = ? AND id_jugador = ?',
                    [pm.minutos, idPartido, pm.id_jugador]
                );
            }
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = Convocatoria;
