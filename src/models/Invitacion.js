const { pool } = require('../config/database');

/**
 * Model: Invitacion
 * 
 * Table: Invitaciones
 * - id_invitacion: CHAR(36) PRIMARY KEY
 * - id_equipo: CHAR(36) NOT NULL
 * - codigo: CHAR(8) NOT NULL UNIQUE
 * - rol: ENUM('ENTRENADOR', 'MANAGER')
 * - estado: ENUM('ACTIVO', 'USADO', 'EXPIRADO')
 * - id_creador: CHAR(36) NOT NULL
 * - id_usado_por: CHAR(36) NULL
 * - fecha_creacion: TIMESTAMP
 * - fecha_expiracion: DATETIME
 * - fecha_uso: DATETIME NULL
 */

class Invitacion {
    constructor(data) {
        this.id_invitacion = data.id_invitacion;
        this.id_equipo = data.id_equipo;
        this.codigo = data.codigo;
        this.rol = data.rol;
        this.estado = data.estado;
        this.id_creador = data.id_creador;
        this.id_usado_por = data.id_usado_por;
        this.fecha_creacion = data.fecha_creacion;
        this.fecha_expiracion = data.fecha_expiracion;
        this.fecha_uso = data.fecha_uso;
        // Joined data
        this.equipo = data.equipo;
        this.club = data.club;
        this.usado_por_nombre = data.usado_por_nombre;
        this.usado_por_apellido = data.usado_por_apellido;
    }

    /**
     * Create new invitation
     */
    static async create(data) {
        const [rows] = await pool.execute(
            'CALL sp_invitacion_create(?, ?, ?, ?, ?)',
            [data.id_invitacion, data.id_equipo, data.codigo, data.rol, data.id_creador]
        );
        return new Invitacion(rows[0][0]);
    }

    /**
     * Get invitation by code
     */
    static async findByCodigo(codigo) {
        const [rows] = await pool.execute('CALL sp_invitacion_get_by_codigo(?)', [codigo]);
        if (rows[0].length === 0) return null;
        return new Invitacion(rows[0][0]);
    }

    /**
     * Get all invitations for a team
     */
    static async findByEquipo(idEquipo) {
        const [rows] = await pool.execute('CALL sp_invitacion_get_by_equipo(?)', [idEquipo]);
        return rows[0].map(row => new Invitacion(row));
    }

    /**
     * Redeem invitation code and join team
     */
    static async redeem(codigo, idUsuario, idStaff) {
        const [rows] = await pool.execute(
            'CALL sp_invitacion_redeem(?, ?, ?)',
            [codigo, idUsuario, idStaff]
        );
        return rows[0][0]; // Returns the new staff record with team info
    }

    /**
     * Delete invitation
     */
    static async delete(id) {
        const [rows] = await pool.execute('CALL sp_invitacion_delete(?)', [id]);
        const result = rows[0] && rows[0][0];
        return result && result.affected_rows > 0;
    }

    /**
     * Generate a random 8-character code
     * Uses uppercase letters and numbers, excluding ambiguous chars (0, O, 1, I, L)
     */
    static generateCode() {
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
}

module.exports = Invitacion;
