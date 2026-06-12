const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const {
    PERMISSIONS,
    requirePermission,
    requirePermissionForResource,
    requireTeamMembership,
    requireTeamMembershipForResource,
    getUserRoleForTeam
} = require('../middleware/permissions');

router.get('/equipo/:idEquipo', requireTeamMembership({ paramName: 'idEquipo' }), staffController.getByEquipo);

router.get('/permissions/:idEquipo/:idUsuario', requireTeamMembership({ paramName: 'idEquipo' }), async (req, res, next) => {
    try {
        const { idEquipo, idUsuario } = req.params;

        if (idUsuario !== req.userId) {
            const requesterRole = await getUserRoleForTeam(req.userId, idEquipo);
            if (requesterRole !== 'HEAD_COACH') {
                return res.status(403).json({
                    error: 'Solo puedes consultar tus propios permisos'
                });
            }
        }

        const role = await getUserRoleForTeam(idUsuario, idEquipo);

        if (!role) {
            return res.status(404).json({
                error: 'Usuario no es parte del cuerpo técnico de este equipo'
            });
        }

        const userPermissions = {};
        for (const [permission, allowedRoles] of Object.entries(PERMISSIONS)) {
            userPermissions[permission] = allowedRoles.includes(role);
        }

        res.json({
            rol: role,
            permissions: userPermissions
        });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', requireTeamMembershipForResource('staff'), staffController.getById);

router.post('/', requirePermission('MANAGE_STAFF'), staffController.create);
router.put('/:id', requirePermissionForResource('MANAGE_STAFF', 'staff'), staffController.update);
router.delete('/:id', requirePermissionForResource('MANAGE_STAFF', 'staff'), staffController.delete);

module.exports = router;
