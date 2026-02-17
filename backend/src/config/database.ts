import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER || 'cvhive',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'cvhive',
  password: process.env.DB_PASSWORD || 'cvhive123',
  port: parseInt(process.env.DB_PORT || '5433'),
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

export default pool;
