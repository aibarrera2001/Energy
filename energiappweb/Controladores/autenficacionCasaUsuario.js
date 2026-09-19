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

// Asistente IA conectado a la base de datos PostgreSQL
exports.procesarAsistenteIA = async (req, res) => {
  const { mensaje, id_usuario } = req.body || {};
  try {
    const texto = (mensaje || '').trim();

    const usuarioResult = id_usuario
      ? await db.query(
          `SELECT id_usuario, nombre, apellido, ciudad FROM usuarios WHERE id_usuario = $1`,
          [id_usuario]
        )
      : await db.query(
          `SELECT id_usuario, nombre, apellido, ciudad FROM usuarios ORDER BY id_usuario ASC LIMIT 1`
        );

    const casaResult = id_usuario
      ? await db.query(
          `SELECT id_casa, direccion, ciudad, consumo_mensual FROM casas WHERE id_usuario = $1 ORDER BY id_casa DESC LIMIT 1`,
          [id_usuario]
        )
      : await db.query(
          `SELECT id_casa, direccion, ciudad, consumo_mensual FROM casas ORDER BY id_casa DESC LIMIT 1`
        );

    const citaResult = id_usuario
      ? await db.query(
          `SELECT COUNT(*) AS total_citas, SUM(CASE WHEN estado = 'PENDIENTE' THEN 1 ELSE 0 END) AS pendientes FROM citas WHERE id_usuario = $1`,
          [id_usuario]
        )
      : await db.query(
          `SELECT COUNT(*) AS total_citas, SUM(CASE WHEN estado = 'PENDIENTE' THEN 1 ELSE 0 END) AS pendientes FROM citas`
        );

    const usuario = usuarioResult.rows[0];
    const casa = casaResult.rows[0];
    const cita = citaResult.rows[0];

    const nombreUsuario = usuario ? `${usuario.nombre} ${usuario.apellido}`.trim() : 'usuario';
    const direccionCasa = casa ? casa.direccion : 'tu propiedad';
    const consumoMensual = casa ? Number(casa.consumo_mensual || 0).toFixed(0) : '0';
    const citasPendientes = Number(cita?.pendientes || 0);
    const textoLower = texto.toLowerCase();

    let respuesta = `He revisado la información registrada en la base de datos para ${nombreUsuario}.`;

    if (textoLower.includes('ahorro') || textoLower.includes('consumo')) {
      respuesta += ` Tu vivienda ${direccionCasa} registra un consumo mensual de ${consumoMensual} kWh.`;
      if (citasPendientes > 0) {
        respuesta += ` También tienes ${citasPendientes} citas pendientes para revisar tu sistema solar.`;
      } else {
        respuesta += ` No tienes citas pendientes; puedes revisar el rendimiento del sistema.`;
      }
    } else if (textoLower.includes('cita') || textoLower.includes('agenda')) {
      respuesta += ` Actualmente tienes ${citasPendientes} citas pendientes y puedes programar una nueva visita técnica.`;
    } else {
      respuesta += ` En ${direccionCasa} puedo ayudarte a revisar consumo, producción y mantenimiento del sistema solar.`;
    }

    res.json({ exito: true, respuesta });
  } catch (error) {
    console.error('Error al consultar el asistente IA:', error);
    res.status(500).json({ exito: false, mensaje: 'Error al conectar con la base de datos' });
  }
};