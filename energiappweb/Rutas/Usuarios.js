const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const usuarioController = require('../controllers/usuarioController');

// Rutas Públicas de Auth
router.post('/registrar', authController.registrarUsuario);
router.post('/login', authController.loginUsuario);

// Rutas de Gestión del Cliente
router.get('/:id_usuario/propiedades', usuarioController.obtenerPropiedades);
router.post('/propiedades', usuarioController.crearPropiedad);

router.get('/:id_usuario/citas', usuarioController.obtenerCitas);
router.post('/citas', usuarioController.crearCita);

router.post('/asistente', usuarioController.procesarAsistenteIA);

module.exports = router;