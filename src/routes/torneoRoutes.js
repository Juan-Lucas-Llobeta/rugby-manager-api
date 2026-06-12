const express = require('express');
const router = express.Router();
const torneoController = require('../controllers/torneoController');
const {
    requirePermission,
    requirePermissionForResource,
    requireTeamMembership,
    requireTeamMembershipForResource
} = require('../middleware/permissions');

router.get('/', requireTeamMembership(), torneoController.getAll);
router.get('/:id/stats', requireTeamMembership(), torneoController.getStats);
router.get('/:id', requireTeamMembershipForResource('torneo'), torneoController.getById);

router.post('/', requirePermission('MANAGE_TOURNAMENTS'), torneoController.create);
router.put('/:id', requirePermissionForResource('MANAGE_TOURNAMENTS', 'torneo'), torneoController.update);
router.delete('/:id', requirePermissionForResource('MANAGE_TOURNAMENTS', 'torneo'), torneoController.delete);

module.exports = router;
