require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT id_empresa, nombre FROM empresas')
  .then(r => { console.log(r.rows); pool.end(); })
  .catch(e => { console.error('Error:', e.message); pool.end(); });