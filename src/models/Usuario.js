const { pool } = require('../config/database');

/**
 * Model: Usuario
 * 
 * Table: Usuarios
 * - id_usuario: CHAR(36) PRIMARY KEY
 * - correo: VARCHAR(255) NOT NULL UNIQUE
 * - apellido: VARCHAR(100) NOT NULL
 * - nombre: VARCHAR(100) NOT NULL
 * - password_hash: VARCHAR(255) NOT NULL
 * - fecha_creacion: TIMESTAMP
 */

class Usuario {
    constructor(data) {
        this.id_usuario = data.id_usuario;
        this.correo = data.correo;
        this.apellido = data.apellido;
        this.nombre = data.nombre;
        this.password_hash = data.password_hash;
        this.fecha_creacion = data.fecha_creacion;
    }

    // Remove sensitive data for API responses
    toJSON() {
        return {
            id_usuario: this.id_usuario,
            correo: this.correo,
            apellido: this.apellido,
            nombre: this.nombre,
            fecha_creacion: this.fecha_creacion
        };
    }

    static async findAll() {
        const [rows] = await pool.execute('CALL sp_usuarios_get_all()');
        return rows[0].map(row => new Usuario(row));
    }

    static async findById(id) {
        const [rows] = await pool.execute('CALL sp_usuarios_get_by_id(?)', [id]);
        if (rows[0].length === 0) return null;
        return new Usuario(rows[0][0]);
    }

    static async findByEmail(correo) {
        const [rows] = await pool.execute('CALL sp_usuarios_get_by_email(?)', [correo]);
        if (rows[0].length === 0) return null;
        return new Usuario(rows[0][0]);
    }

    static async create(data) {
        const [rows] = await pool.execute(
            'CALL sp_usuarios_create(?, ?, ?, ?, ?)',
            [data.id_usuario, data.correo, data.apellido, data.nombre, data.password_hash]
        );
        return new Usuario(rows[0][0]);
    }

    static async update(id, data) {
        const [rows] = await pool.execute(
            'CALL sp_usuarios_update(?, ?, ?, ?)',
            [id, data.correo, data.apellido, data.nombre]
        );
        return new Usuario(rows[0][0]);
    }

    static async updatePassword(id, passwordHash) {
        const [rows] = await pool.execute(
            'CALL sp_usuarios_update_password(?, ?)',
            [id, passwordHash]
        );
        const result = rows[0] && rows[0][0];
        return result && result.affected_rows > 0;
    }

    static async delete(id) {
        const [rows] = await pool.execute('CALL sp_usuarios_delete(?)', [id]);
        const result = rows[0] && rows[0][0];
        return result && result.affected_rows > 0;
    }
}

module.exports = Usuario;
