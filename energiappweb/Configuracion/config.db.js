const { Pool } = require('pg');
require('dotenv').config();

const getSupabaseProjectRef = () => {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const match = rawUrl.match(/https?:\/\/([^.]+)\.supabase\.co/i);
  return match ? match[1] : null;
};

const supabaseProjectRef = getSupabaseProjectRef();

const isSupabaseConnection = Boolean(process.env.SUPABASE_URL || process.env.DB_HOST?.includes('supabase.co'));

const config = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  : process.env.SUPABASE_URL && process.env.DB_PASSWORD
    ? {
        host: process.env.DB_HOST || `db.${supabaseProjectRef}.supabase.co`,
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME || 'postgres',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        ssl: { rejectUnauthorized: false }
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME || 'energiapp',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        ...(isSupabaseConnection ? { ssl: { rejectUnauthorized: false } } : {})
      };

if (!process.env.DATABASE_URL) {
  console.warn('Falta DATABASE_URL en el .env: se usará la configuración local (localhost).');
}
const pool = new Pool(config);

pool.on('connect', () => {
  console.log('⚡ Conexión exitosa a la base de datos PostgreSQL (EnergiApp)');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};