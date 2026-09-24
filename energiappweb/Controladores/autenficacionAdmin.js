const db = require('../Configuracion/config.db');

// Obtener estadísticas del Admin Dashboard (admin-dashboard.html)
exports.obtenerEstadisticasDashboard = async (req, res) => {
  try {
    const totalUsuarios = await db.query('SELECT COUNT(*) FROM usuarios');
    const totalCasas = await db.query('SELECT COUNT(*) FROM casas');
    const citasPendientes = await db.query("SELECT COUNT(*) FROM citas WHERE estado = 'PENDIENTE'");
    const totalPaneles = await db.query('SELECT SUM(cantidad) FROM paneles');

    res.json({
      exito: true,
      datos: {
        usuarios: totalUsuarios.rows[0].count,
        casas: totalCasas.rows[0].count,
        incidencias: citasPendientes.rows[0].count,
        paneles: totalPaneles.rows[0].sum || 0
      }
    });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: error.message });
  }
};

// Obtener todas las citas para el Administrador (admin-citas.html)
exports.obtenerTodasLasCitas = async (req, res) => {
  try {
    const query = `
      SELECT c.id_cita, c.fecha, c.hora, c.tipo_servicio, c.estado, c.nombre_cliente,
             u.nombre AS usuario_nombre, u.apellido AS usuario_apellido, u.correo
      FROM citas c
      LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
      ORDER BY c.fecha DESC
    `;
    const { rows } = await db.query(query);
    res.json({ exito: true, datos: rows });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: error.message });
  }
};

// Obtener todos los usuarios (admin-usuarios.html)
exports.obtenerListaUsuarios = async (req, res) => {
  try {
    const query = `
      SELECT id_usuario, nombre, apellido, correo, ciudad, estado, creado_en 
      FROM usuarios 
      ORDER BY id_usuario DESC
    `;
    const { rows } = await db.query(query);
    res.json({ exito: true, datos: rows });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: error.message });
  }
};