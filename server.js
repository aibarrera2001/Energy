const express = require('express');
const path = require('path');
const db = require('./energiappweb/Configuracion/config.db');
const usuariosRoutes = require('./energiappweb/Rutas/Usuarios');

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'energiappweb', 'Public');

async function ensureDatabaseObjects() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS chat_ia_historial (
      id SERIAL PRIMARY KEY,
      id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
      remitente VARCHAR(20) NOT NULL DEFAULT 'usuario',
      mensaje TEXT NOT NULL,
      creado_en TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/usuarios', usuariosRoutes);
app.use(express.static(publicDir));

app.get('/api/health', async (_req, res) => {
  try {
    const result = await db.query('SELECT NOW() as now');
    res.json({
      ok: true,
      app: 'EnergiApp',
      status: 'running',
      db: 'connected',
      timestamp: result.rows[0]?.now
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      app: 'EnergiApp',
      status: 'database_error',
      db: 'disconnected',
      error: error.message
    });
  }
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(publicDir, 'Paginas', 'Principal', 'index.html'));
});

app.get('/usuario-login', (_req, res) => {
  res.sendFile(path.join(publicDir, 'Paginas', 'Usuario', 'usuario-login.html'));
});

app.get('/usuario-registro', (_req, res) => {
  res.sendFile(path.join(publicDir, 'Paginas', 'Usuario', 'usuario-registro.html'));
});

app.get('/dashboard', (_req, res) => {
  res.sendFile(path.join(publicDir, 'Paginas', 'Usuario', 'dashboard.html'));
});

app.get('/dashboard.html', (_req, res) => {
  res.sendFile(path.join(publicDir, 'Paginas', 'Usuario', 'dashboard.html'));
});

app.get('/admin-login', (_req, res) => {
  res.sendFile(path.join(publicDir, 'Paginas', 'Administrador', 'admin-login.html'));
});

app.get('/admin-registro', (_req, res) => {
  res.sendFile(path.join(publicDir, 'Paginas', 'Administrador', 'admin-registro.html'));
});

app.get('/admin-dashboard', (_req, res) => {
  res.sendFile(path.join(publicDir, 'Paginas', 'Administrador', 'admin-dashboard.html'));
});

app.get('/admin-dashboard.html', (_req, res) => {
  res.sendFile(path.join(publicDir, 'Paginas', 'Administrador', 'admin-dashboard.html'));
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const body = req.body || {};
    const email = String(body.email || '').trim();
    const password = String(body.password || '').trim();

    if (!email || !password) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Debes ingresar el correo y la contraseña del administrador.'
      });
    }

    const result = await db.query(
      `
        SELECT id_empresa, nombre, nit, ciudad, direccion, telefono, email,
               correo_admin, contrasena_admin, region, estado
        FROM empresas
        WHERE LOWER(correo_admin) = LOWER($1)
          AND contrasena_admin = $2
        LIMIT 1
      `,
      [email, password]
    );

    if (!result.rows.length) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Credenciales de administrador incorrectas.'
      });
    }

    const empresa = result.rows[0];

    return res.json({
      exito: true,
      mensaje: 'Inicio de sesión correcto.',
      empresa: {
        id_empresa: empresa.id_empresa,
        nombre: empresa.nombre,
        nit: empresa.nit,
        ciudad: empresa.ciudad,
        direccion: empresa.direccion,
        telefono: empresa.telefono,
        email: empresa.email,
        correo_admin: empresa.correo_admin,
        region: empresa.region,
        estado: empresa.estado
      }
    });
  } catch (error) {
    console.error('Error en login admin:', error);
    return res.status(500).json({ exito: false, mensaje: error.message });
  }
});

app.get('/api/admin/dashboard/:id', async (req, res) => {
  try {
    const empresaId = Number(req.params.id);

    if (!Number.isFinite(empresaId)) {
      return res.status(400).json({ exito: false, mensaje: 'ID de empresa inválido.' });
    }

    const empresaQuery = await db.query(
      `SELECT id_empresa, nombre, nit, ciudad, direccion, telefono, email, correo_admin, region, estado, fecha_registro
       FROM empresas
       WHERE id_empresa = $1`,
      [empresaId]
    );

    const inventarioQuery = await db.query(
      `SELECT COALESCE(SUM(cantidad), 0) AS total_paneles, COALESCE(SUM(cantidad * precio_empresa), 0) AS valor_inventario
       FROM inventario_empresa
       WHERE empresa_id = $1`,
      [empresaId]
    );

    const usuariosCount = await db.query('SELECT COUNT(*) AS total FROM usuarios');
    const casasCount = await db.query('SELECT COUNT(*) AS total FROM casas');
    const citasCount = await db.query("SELECT COUNT(*) AS total FROM citas WHERE estado = 'PENDIENTE'");

    const empresa = empresaQuery.rows[0] || null;
    const inventario = inventarioQuery.rows[0] || { total_paneles: 0, valor_inventario: 0 };

    return res.json({
      exito: true,
      empresa,
      metrics: {
        usuarios: Number(usuariosCount.rows[0]?.total || 0),
        casas: Number(casasCount.rows[0]?.total || 0),
        citas_pendientes: Number(citasCount.rows[0]?.total || 0),
        total_paneles: Number(inventario.total_paneles || 0),
        valor_inventario: Number(inventario.valor_inventario || 0)
      }
    });
  } catch (error) {
    console.error('Error al obtener dashboard admin:', error);
    return res.status(500).json({ exito: false, mensaje: error.message });
  }
});

app.post('/api/admin/registro', async (req, res) => {
  try {
    const body = req.body || {};
    const requiredFields = [
      'nombre', 'nit', 'ciudad', 'direccion', 'telefono', 'email',
      'aportes', 'diferenciadores', 'correoAdmin', 'nombreAdmin',
      'telefonoAdmin', 'contrasena'
    ];

    const missingField = requiredFields.find((field) => !String(body[field] || '').trim());
    if (missingField) {
      return res.status(400).json({ exito: false, mensaje: `Falta el campo obligatorio: ${missingField}` });
    }

    const paneles = Array.isArray(body.paneles) ? body.paneles : [];
    if (!paneles.length) {
      return res.status(400).json({ exito: false, mensaje: 'Debe registrar al menos un panel en el inventario.' });
    }

    const empresaQuery = `
      INSERT INTO empresas (
        nombre, nit, ciudad, direccion, telefono, email,
        descripcion_aportes, diferenciadores,
        correo_admin, contrasena_admin, region
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const empresaResult = await db.query(empresaQuery, [
      body.nombre.trim(),
      body.nit.trim(),
      body.ciudad.trim(),
      body.direccion.trim(),
      body.telefono.trim(),
      body.email.trim(),
      body.aportes.trim(),
      body.diferenciadores.trim(),
      body.correoAdmin.trim(),
      body.contrasena.trim(),
      body.region || 'COSTA_CARIBEÑA'
    ]);

    const empresa = empresaResult.rows[0];
    const inserts = [];

    for (const panel of paneles) {
      const nombre = String(panel.nombre || '').trim();
      const tipo = String(panel.tipo || '').trim();
      const potencia = Number(panel.potencia);
      const eficiencia = Number(panel.eficiencia);
      const stock = Number(panel.stock);
      const precio = Number(panel.precio);

      if (!nombre || !tipo || !Number.isFinite(potencia) || !Number.isFinite(eficiencia) || !Number.isFinite(stock) || !Number.isFinite(precio)) {
        continue;
      }

      const descripcion = `Inventario registrado desde registro de empresa. Stock disponible: ${Math.max(0, Math.round(stock))}`;

      inserts.push(
        db.query(
          `INSERT INTO paneles_solares (nombre, tipo, potencia_w, eficiencia, precio, descripcion, empresa_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [nombre, tipo, potencia, eficiencia, precio, descripcion, empresa.id_empresa]
        )
      );

      inserts.push(
        db.query(
          `INSERT INTO inventario_empresa (empresa_id, nombre_panel, cantidad, precio_empresa)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (empresa_id, nombre_panel)
           DO UPDATE SET cantidad = EXCLUDED.cantidad, precio_empresa = EXCLUDED.precio_empresa`,
          [empresa.id_empresa, tipo, Math.max(0, Math.round(stock)), precio]
        )
      );
    }

    if (inserts.length === 0) {
      return res.status(400).json({ exito: false, mensaje: 'No se registraron paneles válidos en el inventario.' });
    }

    await Promise.all(inserts);

    return res.status(201).json({
      exito: true,
      mensaje: 'Empresa e inventario guardados correctamente.',
      datos: {
        empresaId: empresa.id_empresa,
        panelesRegistrados: inserts.length / 2
      }
    });
  } catch (error) {
    console.error('Error al registrar empresa e inventario:', error);
    return res.status(500).json({ exito: false, mensaje: error.message });
  }
});

ensureDatabaseObjects().catch((error) => {
  console.error('Error al preparar tablas auxiliares:', error);
});

app.listen(PORT, () => {
  console.log(`Servidor EnergiApp corriendo en http://localhost:${PORT}`);
});
