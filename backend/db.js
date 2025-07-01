const { Pool } = require('pg');

const pool = new Pool({
  user: 'basesdedatos',
  host: 'basesdedatos-1.cjuas0igmcb8.us-east-2.rds.amazonaws.com',
  database: 'postgres',
  password: 'basesdedatos',
  port: 5432,
});

module.exports = pool;

