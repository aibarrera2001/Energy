const { Pool } = require('pg');
require('dotenv').config();

const config = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'energiapp',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || ''
    };

const pool = new Pool(config);

pool.on('connect', () => {
  console.log('⚡ Conexión exitosa a la base de datos PostgreSQL (EnergiApp)');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};