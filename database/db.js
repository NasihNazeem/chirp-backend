const Pool = require("pg").Pool;
require("dotenv").config();

const poolConfig = {
  max: 5,
  min: 2,
  idleTimeoutMillis: 600000,
  connectionString: process.env.DB_URL + "?sslmode=prefer",
};

const pool = new Pool(poolConfig);

module.exports = pool;
