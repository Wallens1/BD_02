const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'BDFINAL',
  password: '12345',
  port: 2006,
});


module.exports = pool;

