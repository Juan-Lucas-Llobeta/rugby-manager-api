const { pool } = require('../config/database');

/**
 * Model: Jugador
 * 
 * Table: Jugadores
 * - id_jugador: CHAR(36) PRIMARY KEY
 * - id_equipo: CHAR(36) NOT NULL FK
 * - nombre: VARCHAR(100) NOT NULL
 * - apellido: VARCHAR(100) NOT NULL
 * - apodo: VARCHAR(50)
 * - fecha_nacimiento: DATE
 * - peso_kg: DECIMAL(5,2)
 * - altura_cm: INT
 * - posicion_principal: VARCHAR(50) NOT NULL
 * - posiciones_alternativas: JSON
 * - estado: ENUM('DISPONIBLE', 'LESIONADO', 'SUSPENDIDO', 'NO_DISPONIBLE')
 */

class Jugador {
    constructor(data) {
        this.id_jugador = data.id_jugador;
        this.id_equipo = data.id_equipo;
        this.nombre = data.nombre;
        this.apellido = data.apellido;
        this.apodo = data.apodo;
        this.fecha_nacimiento = data.fecha_nacimiento;
        this.peso_kg = data.peso_kg;
        this.altura_cm = data.altura_cm;
        this.posicion_principal = data.posicion_principal;
        this.posiciones_alternativas = data.posiciones_alternativas;
        this.estado = data.estado;
    }

    static async findAll() {
        const [rows] = await pool.execute('CALL sp_jugadores_get_all()');
        return rows[0].map(row => new Jugador(row));
    }

    static async findById(id) {
        const [rows] = await pool.execute('CALL sp_jugadores_get_by_id(?)', [id]);
        if (rows[0].length === 0) return null;
        return new Jugador(rows[0][0]);
    }

    static async findByEquipo(idEquipo) {
        const [rows] = await pool.execute('CALL sp_jugadores_get_by_equipo(?)', [idEquipo]);
        return rows[0].map(row => new Jugador(row));
    }

    static async findByEquipoAndEstado(idEquipo, estado) {
        const [rows] = await pool.execute('CALL sp_jugadores_get_by_equipo_estado(?, ?)', [idEquipo, estado]);
        return rows[0].map(row => new Jugador(row));
    }

    static async create(data) {
        const [rows] = await pool.execute(
            'CALL sp_jugadores_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                data.id_jugador,
                data.id_equipo,
                data.nombre,
                data.apellido,
                data.apodo,
                data.fecha_nacimiento,
                data.peso_kg,
                data.altura_cm,
                data.posicion_principal,
                JSON.stringify(data.posiciones_alternativas || []),
                data.estado || 'DISPONIBLE'
            ]
        );
        return new Jugador(rows[0][0]);
    }

    static async update(id, data) {
        const [rows] = await pool.execute(
            'CALL sp_jugadores_update(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                id,
                data.nombre,
                data.apellido,
                data.apodo,
                data.fecha_nacimiento,
                data.peso_kg,
                data.altura_cm,
                data.posicion_principal,
                JSON.stringify(data.posiciones_alternativas || []),
                data.estado
            ]
        );
        return new Jugador(rows[0][0]);
    }

    static async updateEstado(id, estado) {
        const [rows] = await pool.execute('CALL sp_jugadores_update_estado(?, ?)', [id, estado]);
        return new Jugador(rows[0][0]);
    }

    static async delete(id) {
        const [rows] = await pool.execute('CALL sp_jugadores_delete(?)', [id]);
        const result = rows[0] && rows[0][0];
        return result && result.affected_rows > 0;
    }

    static async getStats(id) {
        const [rows] = await pool.execute('CALL sp_jugador_stats_by_id(?)', [id]);
        if (rows[0].length === 0) return null;
        return rows[0][0];
    }

    static async getStatsByEquipo(idEquipo) {
        const [rows] = await pool.execute('CALL sp_jugador_stats_by_equipo(?)', [idEquipo]);
        return rows[0];
    }
}

module.exports = Jugador;
