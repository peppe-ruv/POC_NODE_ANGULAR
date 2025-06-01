const { Pool } = require('pg');
require('dotenv').config(); // For loading environment variables

let pool;

if (process.env.DATABASE_URL) {
  // Heroku provides DATABASE_URL
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Heroku connections
    }
  });
  console.log('Connecting to PostgreSQL via DATABASE_URL (Heroku).');
} else {
  // Local development or other environments
  pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'contatori_db',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
  });
  console.log('Connecting to PostgreSQL via individual DB variables (local).');
}

pool.on('connect', () => {
  console.log('Successfully connected to the PostgreSQL database.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
