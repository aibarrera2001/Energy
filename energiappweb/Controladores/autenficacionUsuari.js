const db = require('../Configuracion/config.db');

// Registro de usuarios
exports.registrarUsuario = async (req, res) => {
  const { nombre, apellido, correo, ciudad, telefono, contrasena } = req.body;

  try {
    // Verificar si el correo ya existe
    const existe = await db.query('SELECT id_usuario FROM usuarios WHERE correo = $1', [correo]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ exito: false, mensaje: 'El correo electrónico ya está registrado.' });
    }

    // Insertar nuevo usuario según baseDatos.sql
    const query = `
      INSERT INTO usuarios (nombre, apellido, correo, ciudad, telefono, contrasena, estado)
      VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVO')
      RETURNING id_usuario, nombre, apellido, correo, ciudad, telefono, estado
    `;
    const valores = [nombre, apellido, correo, ciudad, telefono, contrasena];
    const resultado = await db.query(query, valores);

    res.status(201).json({
      exito: true,
      mensaje: 'Usuario registrado correctamente',
      datos: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error en registrarUsuario:', error);
    res.status(500).json({ exito: false, mensaje: 'Error interno en el servidor' });
  }
};

// Login de usuarios
exports.loginUsuario = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const query = `
      SELECT id_usuario, nombre, apellido, correo, ciudad, telefono, contrasena, estado 
      FROM usuarios 
      WHERE correo = $1
    `;
    const resultado = await db.query(query, [correo]);

    if (resultado.rows.length === 0) {
      return res.status(401).json({ exito: false, mensaje: 'Credenciales inválidas' });
    }

    const usuario = resultado.rows[0];

    if (usuario.estado !== 'ACTIVO') {
      return res.status(403).json({ exito: false, mensaje: 'Cuenta inactiva o suspendida' });
    }

    if (usuario.contrasena !== contrasena) {
      return res.status(401).json({ exito: false, mensaje: 'Credenciales inválidas' });
    }

    // Actualizar último login
    await db.query('UPDATE usuarios SET ultimo_login = NOW() WHERE id_usuario = $1', [usuario.id_usuario]);

    res.json({
      exito: true,
      datos: {
        id: usuario.id_usuario,
        nombre: `${usuario.nombre} ${usuario.apellido}`,
        correo: usuario.correo,
        ciudad: usuario.ciudad
      }
    });
  } catch (error) {
    console.error('Error en loginUsuario:', error);
    res.status(500).json({ exito: false, mensaje: 'Error al procesar la solicitud' });
  }
};