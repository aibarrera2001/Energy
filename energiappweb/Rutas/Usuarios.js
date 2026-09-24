const express = require('express');
const router = express.Router();
const authController = require('../Controladores/autenficacionUsuari');
const usuarioController = require('../Controladores/autenficacionCasaUsuario');

// Rutas Públicas de Auth
router.post('/registrar', authController.registrarUsuario);
router.post('/login', authController.loginUsuario);

// Rutas de resumen y paneles del dashboard
router.get('/:id_usuario/resumen', usuarioController.obtenerResumenDashboard);
router.get('/:id_usuario/paneles', usuarioController.obtenerPanelesUsuario);
router.post('/:id_usuario/paneles/inventario', usuarioController.crearPanelInventario);
router.get('/:id_usuario/reportes', usuarioController.obtenerReportesUsuario);
router.get('/:id_usuario/chat/historial', usuarioController.obtenerHistorialChat);
router.post('/:id_usuario/chat', usuarioController.enviarMensajeChat);

// Rutas de Gestión del Cliente
router.get('/:id_usuario/propiedades', usuarioController.obtenerPropiedades);
router.post('/propiedades', usuarioController.crearPropiedad);
router.get('/:id_usuario/balance', usuarioController.obtenerBalanceCasa);
router.get('/:id_usuario/casas/:id_casa/balance', usuarioController.obtenerBalanceCasa);
router.get('/:id_usuario/escena-3d', usuarioController.obtenerEscena3D);
router.get('/:id_usuario/casas/:id_casa/escena-3d', usuarioController.obtenerEscena3D);

router.get('/:id_usuario/citas', usuarioController.obtenerCitas);
router.post('/citas', usuarioController.crearCita);

router.post('/asistente', usuarioController.procesarAsistenteIA);

module.exports = router;