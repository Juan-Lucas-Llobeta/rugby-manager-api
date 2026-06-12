const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

/**
 * Ownership middleware — ensures users can only access their own data.
 * Compares the :id param with req.userId from the JWT token.
 */
function requireOwnership(req, res, next) {
    if (req.params.id !== req.userId) {
        return res.status(403).json({
            error: 'Solo puedes acceder a tu propia cuenta'
        });
    }
    next();
}

// NOTE: GET / (list all users) and POST / (create) have been removed.
// - Listing all users leaked personal data (names, emails).
// - User creation should go through /api/auth/register.

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por ID (solo tu propio perfil)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       403:
 *         description: No tienes permiso para ver este perfil
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', requireOwnership, usuarioController.getById);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualizar usuario (solo tu propio perfil)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioUpdate'
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       403:
 *         description: No tienes permiso para modificar este perfil
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id', requireOwnership, usuarioController.update);

/**
 * @swagger
 * /api/usuarios/{id}/password:
 *   patch:
 *     summary: Actualizar contraseña (solo tu propia cuenta)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       403:
 *         description: No tienes permiso para cambiar esta contraseña
 *       404:
 *         description: Usuario no encontrado
 */
router.patch('/:id/password', requireOwnership, usuarioController.updatePassword);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Eliminar usuario (solo tu propia cuenta)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       403:
 *         description: No tienes permiso para eliminar este perfil
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', requireOwnership, usuarioController.delete);

module.exports = router;

