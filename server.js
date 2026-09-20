require('dotenv').config();

const express = require('express');
const path = require('path');
const db = require('./energiappweb/Configuracion/config.db');
const usuariosRoutes = require('./energiappweb/Rutas/Usuarios');

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'energiappweb', 'Public');

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

app.get('/admin-login', (_req, res) => {
  res.sendFile(path.join(publicDir, 'Paginas', 'Administrador', 'usuario-login.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor EnergiApp corriendo en http://localhost:${PORT}`);
});