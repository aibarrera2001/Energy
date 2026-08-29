const db = require('../config/db');

// Obtener propiedades de un usuario
exports.obtenerPropiedades = async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const query = `
      SELECT id_casa, direccion, ciudad, consumo_mensual, tipo_propiedad, 
             numero_pisos, area_techo_m2 
      FROM casas 
      WHERE id_usuario = $1 
      ORDER BY id_casa DESC
    `;
    const { rows } = await db.query(query, [id_usuario]);
    res.json({ exito: true, datos: rows });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: error.message });
  }
};

// Guardar nueva propiedad
exports.crearPropiedad = async (req, res) => {
  const { id_usuario, direccion, ciudad, consumo_mensual, tipo_propiedad, area_techo_m2 } = req.body;
  try {
    const query = `
      INSERT INTO casas (id_usuario, direccion, ciudad, consumo_mensual, tipo_propiedad, area_techo_m2)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const { rows } = await db.query(query, [
      id_usuario,
      direccion,
      ciudad,
      consumo_mensual || 0,
      tipo_propiedad || 'CASA',
      area_techo_m2 || 0
    ]);
    res.status(201).json({ exito: true, datos: rows[0] });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: error.message });
  }
};

// Obtener citas del usuario
exports.obtenerCitas = async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const query = `
      SELECT c.id_cita, c.fecha, c.hora, c.tipo_servicio, c.estado, c.notas, 
             e.nombre AS empresa_nombre, ca.direccion AS casa_direccion
      FROM citas c
      INNER JOIN empresas e ON c.empresa_id = e.id_empresa
      LEFT JOIN casas ca ON c.id_casa = ca.id_casa
      WHERE c.id_usuario = $1
      ORDER BY c.fecha ASC, c.hora ASC
    `;
    const { rows } = await db.query(query, [id_usuario]);
    res.json({ exito: true, datos: rows });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: error.message });
  }
};

// Guardar una nueva cita
exports.crearCita = async (req, res) => {
  const { id_usuario, empresa_id, id_casa, fecha, hora, tipo_servicio, notas, nombre_cliente } = req.body;
  try {
    const query = `
      INSERT INTO citas (id_usuario, empresa_id, id_casa, fecha, hora, tipo_servicio, notas, nombre_cliente, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDIENTE')
      RETURNING *
    `;
    const { rows } = await db.query(query, [
      id_usuario,
      empresa_id || 1, // Fallback por defecto a la empresa principal
      id_casa || null,
      fecha,
      hora,
      tipo_servicio,
      notas || '',
      nombre_cliente || ''
    ]);
    res.status(201).json({ exito: true, datos: rows[0] });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: error.message });
  }
};

// Asistente IA / Chat Mock de integración con DeepSeek API
exports.procesarAsistenteIA = async (req, res) => {
  const { mensaje } = req.body;
  try {
    // Si cuentas con la libreria de DeepSeek / OpenAI, aquí se redirige la solicitud.
    const respuesta = `He analizado tu mensaje: "${mensaje}". Te sugiero revisar el rendimiento de tus paneles entre las 11:00 AM y 2:00 PM para un ahorro óptimo.`;
    res.json({ exito: true, respuesta });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: 'Error al conectar con la IA' });
  }
};