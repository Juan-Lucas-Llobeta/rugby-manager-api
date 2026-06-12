const { pool } = require('../config/database');
const Staff = require('../models/Staff');

/**
 * Permission Matrix
 * 
 * Action                    | HEAD_COACH | ENTRENADOR | MANAGER
 * --------------------------|------------|------------|--------
 * Edit team settings        |     ✅     |     ❌     |   ❌
 * Invite coaches            |     ✅     |     ❌     |   ❌
 * Manage staff roles        |     ✅     |     ❌     |   ❌
 * Manage roster             |     ✅     |     ✅     |   ✅
 * Create/edit matches       |     ✅     |     ✅     |   ❌
 * Live game control         |     ✅     |     ✅     |   ❌
 * Manage trainings          |     ✅     |     ✅     |   ✅
 * Take attendance           |     ✅     |     ✅     |   ✅
 * View stats                |     ✅     |     ✅     |   ✅
 * Manage tournaments        |     ✅     |     ✅     |   ❌
 */

// Permission definitions
const PERMISSIONS = {
    TEAM_SETTINGS: ['HEAD_COACH'],
    INVITE_COACHES: ['HEAD_COACH'],
    MANAGE_STAFF: ['HEAD_COACH'],
    MANAGE_ROSTER: ['HEAD_COACH', 'ENTRENADOR', 'MANAGER'],
    MANAGE_MATCHES: ['HEAD_COACH', 'ENTRENADOR'],
    LIVE_GAME: ['HEAD_COACH', 'ENTRENADOR'],
    MANAGE_TRAININGS: ['HEAD_COACH', 'ENTRENADOR', 'MANAGER'],
    MANAGE_TOURNAMENTS: ['HEAD_COACH', 'ENTRENADOR'],
    TAKE_ATTENDANCE: ['HEAD_COACH', 'ENTRENADOR', 'MANAGER'],
    VIEW_STATS: ['HEAD_COACH', 'ENTRENADOR', 'MANAGER'],
    VIEW_ALL: ['HEAD_COACH', 'ENTRENADOR', 'MANAGER']
};

/**
 * Get user's role for a specific team
 * @param {string} userId - User ID
 * @param {string} teamId - Team ID
 * @returns {Promise<string|null>} - Role or null if not staff
 */
async function getUserRoleForTeam(userId, teamId) {
    try {
        const staffRecords = await Staff.findByUsuario(userId);
        const teamStaff = staffRecords.find(s => s.id_equipo === teamId);
        return teamStaff ? teamStaff.rol : null;
    } catch (error) {
        console.error('Error getting user role:', error);
        return null;
    }
}

/**
 * Resolve the team ID from a resource ID by looking up the resource in the database.
 * This allows permission checks on routes where the param is a resource ID (not a team ID).
 * 
 * @param {string} resourceType - One of: 'partido', 'jugador', 'entrenamiento', 'torneo'
 * @param {string} resourceId - The resource UUID
 * @returns {Promise<string|null>} - The team ID or null
 */
async function resolveTeamIdFromResource(resourceType, resourceId) {
    try {
        let query;
        switch (resourceType) {
            // Direct resources (have id_equipo column)
            case 'partido':
                query = 'SELECT id_equipo FROM Partidos WHERE id_partido = ?';
                break;
            case 'jugador':
                query = 'SELECT id_equipo FROM Jugadores WHERE id_jugador = ?';
                break;
            case 'entrenamiento':
                query = 'SELECT id_equipo FROM Entrenamientos WHERE id_entrenamiento = ?';
                break;
            case 'invitacion':
                query = 'SELECT id_equipo FROM Invitaciones WHERE id_invitacion = ?';
                break;

            // Child resources (need JOIN to resolve team)
            case 'asistencia':
                query = `SELECT e.id_equipo FROM Asistencias a 
                         JOIN Entrenamientos e ON a.id_entrenamiento = e.id_entrenamiento 
                         WHERE a.id_asistencia = ?`;
                break;
            case 'convocatoria':
                query = `SELECT p.id_equipo FROM Convocatorias c 
                         JOIN Partidos p ON c.id_partido = p.id_partido 
                         WHERE c.id_convocatoria = ?`;
                break;
            case 'evento':
                // Events: try Eventos_Puntaje first, fall back to Eventos_Formacion
                query = `SELECT p.id_equipo FROM Eventos_Puntaje ep 
                         JOIN Partidos p ON ep.id_partido = p.id_partido 
                         WHERE ep.id_evento_puntaje = ?`;
                break;
            case 'evento_puntaje':
                query = `SELECT p.id_equipo FROM Eventos_Puntaje ep 
                         JOIN Partidos p ON ep.id_partido = p.id_partido 
                         WHERE ep.id_evento_puntaje = ?`;
                break;
            case 'evento_formacion':
                query = `SELECT p.id_equipo FROM Eventos_Formacion ef 
                         JOIN Partidos p ON ef.id_partido = p.id_partido 
                         WHERE ef.id_evento_formacion = ?`;
                break;

            case 'torneo':
                query = 'SELECT id_equipo FROM Torneos WHERE id_torneo = ?';
                break;
            case 'staff':
                query = 'SELECT id_equipo FROM Staff WHERE id_staff = ?';
                break;
            default:
                return null;
        }
        const [rows] = await pool.query(query, [resourceId]);

        // For generic 'evento' type, if Eventos_Puntaje didn't match, try Eventos_Formacion
        if (rows.length === 0 && resourceType === 'evento') {
            const fallbackQuery = `SELECT p.id_equipo FROM Eventos_Formacion ef 
                                   JOIN Partidos p ON ef.id_partido = p.id_partido 
                                   WHERE ef.id_evento_formacion = ?`;
            const [fallbackRows] = await pool.query(fallbackQuery, [resourceId]);
            return fallbackRows.length > 0 ? fallbackRows[0].id_equipo : null;
        }

        return rows.length > 0 ? rows[0].id_equipo : null;
    } catch (error) {
        console.error(`Error resolving team ID from ${resourceType}:`, error);
        return null;
    }
}

/**
 * Resolve team ID from request params, query, body, or resource lookup.
 * @param {import('express').Request} req
 * @param {string|null} resourceType - Resource type for req.params.id lookup
 * @returns {Promise<string|null>}
 */
async function resolveTeamIdForRequest(req, resourceType = null) {
    if (req.params.idPartido) {
        return resolveTeamIdFromResource('partido', req.params.idPartido);
    }
    if (req.params.idEntrenamiento) {
        return resolveTeamIdFromResource('entrenamiento', req.params.idEntrenamiento);
    }
    if (req.params.idJugador) {
        return resolveTeamIdFromResource('jugador', req.params.idJugador);
    }
    if (req.params.idEquipo) {
        return req.params.idEquipo;
    }
    if (req.params.id && resourceType) {
        return resolveTeamIdFromResource(resourceType, req.params.id);
    }
    if (req.body?.id_entrenamiento) {
        return resolveTeamIdFromResource('entrenamiento', req.body.id_entrenamiento);
    }
    if (req.body?.id_partido) {
        return resolveTeamIdFromResource('partido', req.body.id_partido);
    }
    return req.body?.id_equipo || req.query?.id_equipo || req.query?.idEquipo || null;
}

/**
 * Attach team membership to request (any staff role).
 * @param {{ paramName?: string }} options - Express param name for team ID (e.g. 'idEquipo', 'id')
 */
function requireTeamMembership(options = {}) {
    const { paramName = null } = options;
    return async (req, res, next) => {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Usuario no autenticado' });
            }

            let teamId = null;
            if (paramName) {
                teamId = req.params[paramName];
            } else {
                teamId = req.params.idEquipo ||
                    req.query.id_equipo ||
                    req.query.idEquipo ||
                    req.body?.id_equipo;
            }

            if (!teamId) {
                return res.status(400).json({ error: 'ID de equipo requerido' });
            }

            const role = await getUserRoleForTeam(userId, teamId);
            if (!role) {
                return res.status(403).json({ error: 'No tienes acceso a este equipo' });
            }

            req.userRole = role;
            req.teamId = teamId;
            next();
        } catch (error) {
            console.error('Team membership middleware error:', error);
            return res.status(500).json({ error: 'Error verificando acceso al equipo' });
        }
    };
}

/**
 * Require team membership for routes where team is resolved via resource ID.
 * @param {string} resourceType
 */
function requireTeamMembershipForResource(resourceType) {
    return async (req, res, next) => {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Usuario no autenticado' });
            }

            const teamId = await resolveTeamIdForRequest(req, resourceType);
            if (!teamId) {
                return res.status(403).json({
                    error: 'No se pudo determinar el equipo para verificar acceso'
                });
            }

            const role = await getUserRoleForTeam(userId, teamId);
            if (!role) {
                return res.status(403).json({ error: 'No tienes acceso a este equipo' });
            }

            req.userRole = role;
            req.teamId = teamId;
            next();
        } catch (error) {
            console.error('Team membership middleware error:', error);
            return res.status(500).json({ error: 'Error verificando acceso al equipo' });
        }
    };
}

/**
 * Middleware: Require specific roles to access the route.
 * Extracts team ID from multiple sources (in priority order):
 *   1. req.params.idEquipo
 *   2. req.body.id_equipo
 *   3. req.query.id_equipo
 *   4. req.params.id (assumed to be team ID for equipo routes)
 * 
 * For routes where req.params.id is a RESOURCE id (not team id), use requirePermissionForResource().
 * 
 * @param {string[]} allowedRoles - Array of roles that can access this route
 */
function requireRole(allowedRoles) {
    return async (req, res, next) => {
        try {
            const userId = req.userId;

            if (!userId) {
                return res.status(401).json({ error: 'Usuario no autenticado' });
            }

            // Get team ID from various possible sources
            const teamId = req.params.idEquipo ||
                req.body.id_equipo ||
                req.query.id_equipo ||
                req.params.id; // fallback: assume params.id is team ID (equipo routes)

            if (!teamId) {
                return res.status(400).json({ error: 'ID de equipo requerido para verificar permisos' });
            }

            const role = await getUserRoleForTeam(userId, teamId);

            if (!role) {
                return res.status(403).json({
                    error: 'No tienes acceso a este equipo'
                });
            }

            if (!allowedRoles.includes(role)) {
                return res.status(403).json({
                    error: `Acción no permitida para tu rol (${role})`,
                    requiredRoles: allowedRoles
                });
            }

            // Attach role and team to request for downstream use
            req.userRole = role;
            req.teamId = teamId;
            next();
        } catch (error) {
            console.error('Permission middleware error:', error);
            return res.status(500).json({ error: 'Error verificando permisos' });
        }
    };
}

/**
 * Middleware: Require specific permission to access the route.
 * Uses the PERMISSIONS matrix. For routes with team ID in direct params.
 * 
 * @param {string} permission - Permission key from PERMISSIONS object
 */
function requirePermission(permission) {
    const allowedRoles = PERMISSIONS[permission];
    if (!allowedRoles) {
        throw new Error(`Unknown permission: ${permission}`);
    }
    return requireRole(allowedRoles);
}

/**
 * Middleware factory: Require permission on a route where params.id is a RESOURCE id (not team id).
 * Resolves the team ID via a DB lookup before checking permissions.
 * 
 * @param {string} permission - Permission key from PERMISSIONS object
 * @param {string} resourceType - 'partido', 'jugador', 'entrenamiento', 'torneo'
 */
/**
 * Middleware factory: Require permission on a route where params contain a RESOURCE id (not team id).
 * Resolves the team ID via a DB lookup before checking permissions.
 * 
 * Team ID resolution order:
 *   1. req.body.id_equipo / req.query.id_equipo / req.params.idEquipo (direct team ID)
 *   2. Named route params (req.params.idPartido, idEntrenamiento, etc.) → resolve via parent resource
 *   3. req.params.id → resolve via resourceType
 *   4. Body fields (req.body.id_partido, id_entrenamiento) → resolve via parent resource
 * 
 * @param {string} permission - Permission key from PERMISSIONS object
 * @param {string} resourceType - Resource type for resolving team from :id param
 */
function requirePermissionForResource(permission, resourceType) {
    const allowedRoles = PERMISSIONS[permission];
    if (!allowedRoles) {
        throw new Error(`Unknown permission: ${permission}`);
    }

    return async (req, res, next) => {
        try {
            const userId = req.userId;

            if (!userId) {
                return res.status(401).json({ error: 'Usuario no autenticado' });
            }

            // 1. Named route params that reference parent resources
            let teamId = await resolveTeamIdForRequest(req, resourceType);

            if (!teamId) {
                // Fail-closed: if we can't determine team context, deny access
                return res.status(403).json({
                    error: 'No se pudo determinar el equipo para verificar permisos'
                });
            }

            const role = await getUserRoleForTeam(userId, teamId);

            if (!role) {
                return res.status(403).json({
                    error: 'No tienes acceso a este equipo'
                });
            }

            if (!allowedRoles.includes(role)) {
                return res.status(403).json({
                    error: `Acción no permitida para tu rol (${role})`,
                    requiredRoles: allowedRoles
                });
            }

            req.userRole = role;
            req.teamId = teamId;
            next();
        } catch (error) {
            console.error('Permission middleware error:', error);
            return res.status(500).json({ error: 'Error verificando permisos' });
        }
    };
}

/**
 * Middleware: Check if user is HEAD_COACH of the team
 */
const requireHeadCoach = requireRole(['HEAD_COACH']);

/**
 * Middleware: Check if user is staff of the team (any role)
 */
const requireTeamAccess = requireRole(['HEAD_COACH', 'ENTRENADOR', 'MANAGER']);

/**
 * Helper to check permission without middleware (for conditional logic)
 */
async function hasPermission(userId, teamId, permission) {
    const allowedRoles = PERMISSIONS[permission];
    if (!allowedRoles) return false;

    const role = await getUserRoleForTeam(userId, teamId);
    return role ? allowedRoles.includes(role) : false;
}

module.exports = {
    PERMISSIONS,
    requireRole,
    requirePermission,
    requirePermissionForResource,
    requireHeadCoach,
    requireTeamAccess,
    requireTeamMembership,
    requireTeamMembershipForResource,
    getUserRoleForTeam,
    resolveTeamIdFromResource,
    resolveTeamIdForRequest,
    hasPermission
};
