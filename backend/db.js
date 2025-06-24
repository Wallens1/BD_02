const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'BDFINAL',
  password: '1113036325',
  port: 5432,
});

module.exports = pool;

