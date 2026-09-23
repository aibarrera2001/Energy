const db = require('../Configuracion/config.db');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8001';

async function consultarServicioPython(ruta, payload) {
  const response = await fetch(`${PYTHON_SERVICE_URL}${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      data = { mensaje: text };
    }
  }

  if (!response.ok) {
    throw new Error(data?.mensaje || data?.detail || 'Error al consultar el servicio Python');
  }

  return data;
}

async function obtenerCasaDelUsuario(id_usuario, id_casa) {
  let query;
  const params = [id_usuario];

  if (id_casa) {
    query = `
      SELECT id_casa, direccion, ciudad, consumo_mensual, tipo_propiedad,
             numero_pisos, area_techo_m2
      FROM casas
      WHERE id_usuario = $1 AND id_casa = $2
      LIMIT 1
    `;
    params.push(id_casa);
  } else {
    query = `
      SELECT id_casa, direccion, ciudad, consumo_mensual, tipo_propiedad,
             numero_pisos, area_techo_m2
      FROM casas
      WHERE id_usuario = $1
      ORDER BY id_casa DESC
      LIMIT 1
    `;
  }

  const { rows } = await db.query(query, params);
  return rows[0] || null;
}

async function obtenerUsuarioPorId(id_usuario) {
  const { rows } = await db.query(
    `SELECT id_usuario, nombre, apellido, correo, ciudad, telefono FROM usuarios WHERE id_usuario = $1`,
    [id_usuario]
  );
  return rows[0] || null;
}

function formatearNombreUsuario(usuario) {
  if (!usuario) return 'Usuario';
  const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();
  return nombreCompleto || usuario.correo || 'Usuario';
}

async function obtenerPropiedadesDb(id_usuario) {
  const { rows } = await db.query(
    `SELECT * FROM casas WHERE id_usuario = $1 ORDER BY id_casa DESC`,
    [id_usuario]
  );
  return rows;
}

async function obtenerPanelesDisponibles() {
  const { rows } = await db.query(
    `SELECT * FROM paneles_solares ORDER BY id ASC`
  );
  return rows;
}

function crearReporteCasa(casa) {
  const consumo = Number(casa.consumo_mensual || 0);
  const area = Number(casa.area_techo_m2 || 0);
  const generacion = Math.max(0, consumo * 1.2 + area * 0.9);
  const ahorro = Math.min(98, Math.round((generacion / Math.max(consumo, 1)) * 100));

  return {
    id_casa: casa.id_casa,
    nombre: casa.direccion || 'Casa sin dirección',
    ciudad: casa.ciudad || 'Sin ciudad',
    consumo_kwh: consumo,
    generacion_kwh: Number(generacion.toFixed(1)),
    ahorro_porcentaje: ahorro,
    estado: ahorro >= 70 ? 'Excelente' : ahorro >= 45 ? 'Bueno' : 'Revisión',
    fecha: new Date().toISOString().slice(0, 10)
  };
}

exports.obtenerPropiedades = async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const rows = await obtenerPropiedadesDb(id_usuario);
    res.json({ exito: true, datos: rows });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: error.message });
  }
};

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

exports.obtenerResumenDashboard = async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const usuario = await obtenerUsuarioPorId(id_usuario);
    if (!usuario) {
      return res.status(404).json({ exito: false, mensaje: 'Usuario no encontrado' });
    }

    const propiedades = await obtenerPropiedadesDb(id_usuario);
    const paneles = propiedades.length > 0 ? await obtenerPanelesDisponibles() : [];
    const citasPendientes = await db.query(
      `SELECT COUNT(*)::int AS total FROM citas WHERE id_usuario = $1 AND estado = 'PENDIENTE'`,
      [id_usuario]
    );

    const reportes = propiedades.length > 0 ? propiedades.map(crearReporteCasa) : [];

    return res.json({
      exito: true,
      datos: {
        usuario: {
          id: usuario.id_usuario,
          nombre: formatearNombreUsuario(usuario),
          correo: usuario.correo,
          ciudad: usuario.ciudad
        },
        propiedades,
        totalPropiedades: propiedades.length,
        paneles,
        totalPaneles: propiedades.length > 0 ? paneles.length : 0,
        citasPendientes: Number(citasPendientes.rows[0]?.total || 0),
        reportes
      }
    });
  } catch (error) {
    console.error('Error al obtener resumen del dashboard:', error);
    return res.status(500).json({ exito: false, mensaje: error.message });
  }
};

exports.obtenerPanelesUsuario = async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const propiedades = await obtenerPropiedadesDb(id_usuario);
    const paneles = propiedades.length > 0 ? await obtenerPanelesDisponibles() : [];

    const panelesConDisponibilidad = paneles.map((panel) => ({
      ...panel,
      disponible: propiedades.length > 0,
      produccion_estimado: Number(((Number(panel.potencia_w || 0) * 0.8 * (Number(panel.eficiencia || 0) / 100))).toFixed(2))
    }));

    return res.json({ exito: true, datos: panelesConDisponibilidad, propiedades });
  } catch (error) {
    return res.status(500).json({ exito: false, mensaje: error.message });
  }
};

exports.crearPanelInventario = async (req, res) => {
  const { id_usuario } = req.params;
  const { nombre, tipo, potencia, eficiencia, stock, precio } = req.body || {};

  if (!id_usuario) {
    return res.status(400).json({ exito: false, mensaje: 'Falta el identificador del usuario.' });
  }

  const nombrePanel = String(nombre || '').trim();
  const tipoPanel = String(tipo || '').trim();
  const potenciaW = Number(potencia);
  const eficienciaPct = Number(eficiencia);
  const cantidadStock = Number(stock);
  const precioUnitario = Number(precio);

  if (!nombrePanel || !tipoPanel || !Number.isFinite(potenciaW) || !Number.isFinite(eficienciaPct) || !Number.isFinite(cantidadStock) || !Number.isFinite(precioUnitario)) {
    return res.status(400).json({ exito: false, mensaje: 'Nombre, tipo, potencia, eficiencia, stock y precio son obligatorios y deben ser válidos.' });
  }

  if (potenciaW < 0 || eficienciaPct < 0 || eficienciaPct > 100 || cantidadStock < 0 || precioUnitario < 0) {
    return res.status(400).json({ exito: false, mensaje: 'Potencia, eficiencia, stock y precio no pueden ser negativos; la eficiencia no debe exceder 100%.' });
  }

  try {
    const panelQuery = `
      INSERT INTO paneles_solares (nombre, tipo, potencia_w, eficiencia, precio, costo_instalacion, descripcion)
      VALUES ($1, $2, $3, $4, $5, 0, $6)
      RETURNING *
    `;

    const panelResult = await db.query(panelQuery, [
      nombrePanel,
      tipoPanel,
      potenciaW,
      eficienciaPct,
      precioUnitario,
      `Inventario registrado por el usuario ${id_usuario}`
    ]);

    const panelGuardado = panelResult.rows[0];

    const empresaResult = await db.query(`SELECT id_empresa FROM empresas ORDER BY id_empresa ASC LIMIT 1`);
    const empresa = empresaResult.rows[0];

    if (empresa) {
      await db.query(
        `INSERT INTO inventario_empresa (empresa_id, nombre_panel, cantidad, precio_empresa)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (empresa_id, nombre_panel)
         DO UPDATE SET cantidad = EXCLUDED.cantidad, precio_empresa = EXCLUDED.precio_empresa`,
        [empresa.id_empresa, tipoPanel, Math.max(0, Math.round(cantidadStock)), precioUnitario]
      );
    }

    return res.status(201).json({
      exito: true,
      mensaje: 'Panel guardado correctamente.',
      datos: {
        ...panelGuardado,
        stock: Math.max(0, Math.round(cantidadStock)),
        precio: precioUnitario
      }
    });
  } catch (error) {
    console.error('Error al guardar inventario del panel:', error);
    return res.status(500).json({ exito: false, mensaje: error.message });
  }
};

exports.obtenerReportesUsuario = async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const propiedades = await obtenerPropiedadesDb(id_usuario);
    const reportes = propiedades.length > 0
      ? propiedades.map(crearReporteCasa)
      : [{
          id_casa: 0,
          nombre: 'Sin propiedades registradas',
          ciudad: 'Sin registro',
          consumo_kwh: 0,
          generacion_kwh: 0,
          ahorro_porcentaje: 0,
          estado: 'Sin datos',
          fecha: new Date().toISOString().slice(0, 10)
        }];

    return res.json({ exito: true, datos: reportes });
  } catch (error) {
    return res.status(500).json({ exito: false, mensaje: error.message });
  }
};

exports.obtenerBalanceCasa = async (req, res) => {
  const { id_usuario, id_casa } = req.params;

  try {
    const casa = await obtenerCasaDelUsuario(id_usuario, id_casa);

    if (!casa) {
      return res.status(404).json({ exito: false, mensaje: 'No se encontró la casa del usuario' });
    }

    const payload = {
      casa: {
        id_casa: casa.id_casa,
        tipo_propiedad: casa.tipo_propiedad,
        numero_pisos: Number(casa.numero_pisos || 1),
        area_techo_m2: Number(casa.area_techo_m2 || 0),
        consumo_mensual: Number(casa.consumo_mensual || 0)
      },
      parametros: {
        eficiencia_panel: 0.18,
        horas_sol_pico: 5.0,
        factor_perdidas: 0.85
      }
    };

    const respuestaPython = await consultarServicioPython('/api/calculos/balance', payload);
    return res.json({ exito: true, datos: respuestaPython.datos || respuestaPython });
  } catch (error) {
    console.error('Error al consultar balance del servicio Python:', error);
    return res.status(502).json({
      exito: false,
      mensaje: 'No fue posible obtener el balance energético del servicio Python',
      detalle: error.message
    });
  }
};

exports.obtenerEscena3D = async (req, res) => {
  const { id_usuario, id_casa } = req.params;

  try {
    const casa = await obtenerCasaDelUsuario(id_usuario, id_casa);

    if (!casa) {
      return res.status(404).json({ exito: false, mensaje: 'No se encontró la casa para renderizar la escena 3D' });
    }

    const payload = {
      casa: {
        id_casa: casa.id_casa,
        tipo_propiedad: casa.tipo_propiedad,
        numero_pisos: Number(casa.numero_pisos || 1),
        area_techo_m2: Number(casa.area_techo_m2 || 0),
        consumo_mensual: Number(casa.consumo_mensual || 0)
      },
      parametros: {
        eficiencia_panel: 0.18,
        horas_sol_pico: 5.0,
        factor_perdidas: 0.85
      },
      numero_paneles: null
    };

    const respuestaPython = await consultarServicioPython('/api/visualizacion/3d', payload);
    return res.json({ exito: true, datos: respuestaPython.datos || respuestaPython });
  } catch (error) {
    console.error('Error al consultar escena 3D del servicio Python:', error);
    return res.status(502).json({
      exito: false,
      mensaje: 'No fue posible obtener la escena 3D del servicio Python',
      detalle: error.message
    });
  }
};

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
      empresa_id || 1,
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

exports.obtenerHistorialChat = async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const { rows } = await db.query(
      `SELECT id, remitente, mensaje, creado_en
       FROM chat_ia_historial
       WHERE id_usuario = $1
       ORDER BY creado_en ASC`,
      [id_usuario]
    );

    return res.json({ exito: true, datos: rows });
  } catch (error) {
    return res.status(500).json({ exito: false, mensaje: error.message });
  }
};

exports.enviarMensajeChat = async (req, res) => {
  const { id_usuario } = req.params;
  const { mensaje } = req.body || {};
  const texto = (mensaje || '').trim();

  if (!texto) {
    return res.status(400).json({ exito: false, mensaje: 'El mensaje está vacío' });
  }

  try {
    const usuario = await obtenerUsuarioPorId(id_usuario);
    const propiedades = await obtenerPropiedadesDb(id_usuario);
    const paneles = await obtenerPanelesDisponibles();
    const citasPendientes = await db.query(
      `SELECT COUNT(*)::int AS total FROM citas WHERE id_usuario = $1 AND estado = 'PENDIENTE'`,
      [id_usuario]
    );

    const nombreUsuario = formatearNombreUsuario(usuario);
    const textoLower = texto.toLowerCase();

    let respuesta = `He revisado tu información en la base de datos. Tienes ${propiedades.length} propiedades registradas, ${paneles.length} opciones de paneles disponibles y ${Number(citasPendientes.rows[0]?.total || 0)} citas pendientes.`;

    if (textoLower.includes('ahorro') || textoLower.includes('consumo')) {
      const consumoTotal = propiedades.reduce((sum, casa) => sum + Number(casa.consumo_mensual || 0), 0);
      respuesta = `Para ${nombreUsuario}, tu consumo total actualmente es ${consumoTotal.toFixed(1)} kWh al mes. Puedes revisar tus propiedades para ajustar el diseño solar y mejorar el rendimiento.`;
    } else if (textoLower.includes('panel') || textoLower.includes('simul')) {
      respuesta = `Hay ${paneles.length} paneles disponibles en la base de datos y puedes seleccionarlos desde la vista de paneles para simular su desempeño.`;
    } else if (textoLower.includes('cita') || textoLower.includes('agenda')) {
      respuesta = `Tienes ${Number(citasPendientes.rows[0]?.total || 0)} citas pendientes. Puedes agendar nuevas desde la sección de citas.`;
    }

    await db.query(
      `INSERT INTO chat_ia_historial (id_usuario, remitente, mensaje) VALUES ($1, 'usuario', $2)`,
      [id_usuario, texto]
    );

    await db.query(
      `INSERT INTO chat_ia_historial (id_usuario, remitente, mensaje) VALUES ($1, 'asistente', $2)`,
      [id_usuario, respuesta]
    );

    return res.json({ exito: true, respuesta });
  } catch (error) {
    console.error('Error en enviarMensajeChat:', error);
    return res.status(500).json({ exito: false, mensaje: error.message });
  }
};

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