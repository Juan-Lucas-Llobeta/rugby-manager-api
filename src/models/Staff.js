const { pool } = require('../config/database');

/**
 * Model: Staff
 * 
 * Table: Staff
 * - id_staff: CHAR(36) PRIMARY KEY
 * - id_usuario: CHAR(36) NOT NULL FK
 * - id_equipo: CHAR(36) NOT NULL FK
 * - rol: ENUM('HEAD_COACH', 'ENTRENADOR', 'MANAGER')
 * - permisos: JSON
 */

class Staff {
    constructor(data) {
        this.id_staff = data.id_staff;
        this.id_usuario = data.id_usuario;
        this.id_equipo = data.id_equipo;
        this.rol = data.rol;
        this.permisos = data.permisos;
        this.es_principal = data.es_principal;
        // Joined fields (when querying with user data)
        this.nombre = data.nombre;
        this.apellido = data.apellido;
        this.correo = data.correo;
        // Joined fields (when querying with equipo data)
        this.equipo = data.equipo;
        this.club = data.club;
    }

    static async findAll() {
        const [rows] = await pool.execute('CALL sp_staff_get_all()');
        return rows[0].map(row => new Staff(row));
    }

    static async findById(id) {
        const [rows] = await pool.execute('CALL sp_staff_get_by_id(?)', [id]);
        if (rows[0].length === 0) return null;
        return new Staff(rows[0][0]);
    }

    static async findByEquipo(idEquipo) {
        const [rows] = await pool.execute('CALL sp_staff_get_by_equipo(?)', [idEquipo]);
        return rows[0].map(row => new Staff(row));
    }

    static async findByUsuario(idUsuario) {
        const [rows] = await pool.execute('CALL sp_staff_get_by_usuario(?)', [idUsuario]);
        return rows[0].map(row => new Staff(row));
    }

    static async create(data) {
        const [rows] = await pool.execute(
            'CALL sp_staff_create(?, ?, ?, ?, ?, ?)',
            [
                data.id_staff,
                data.id_usuario,
                data.id_equipo,
                data.rol,
                JSON.stringify(data.permisos || []),
                data.es_principal || false
            ]
        );
        return new Staff(rows[0][0]);
    }

    static async setPrincipal(id) {
        const [rows] = await pool.execute('CALL sp_staff_set_principal(?)', [id]);
        if (rows[0].length === 0) return null;
        return new Staff(rows[0][0]);
    }

    static async update(id, data) {
        const [rows] = await pool.execute(
            'CALL sp_staff_update(?, ?, ?)',
            [id, data.rol, JSON.stringify(data.permisos || [])]
        );
        return new Staff(rows[0][0]);
    }

    static async delete(id) {
        const [rows] = await pool.execute('CALL sp_staff_delete(?)', [id]);
        const result = rows[0] && rows[0][0];
        return result && result.affected_rows > 0;
    }
}

module.exports = Staff;
