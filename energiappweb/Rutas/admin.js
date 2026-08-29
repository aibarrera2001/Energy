const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/dashboard-stats', adminController.obtenerEstadisticasDashboard);
router.get('/citas', adminController.obtenerTodasLasCitas);
router.get('/usuarios', adminController.obtenerListaUsuarios);

module.exports = router;