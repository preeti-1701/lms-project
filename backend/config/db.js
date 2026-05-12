const { Pool } = require("pg");

console.log("ENV USER:", process.env.DB_USER);
console.log("ENV PASSWORD:", process.env.DB_PASSWORD);

const pool = new Pool({
  user: process.env.DB_USER,      // MUST be from .env
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const testConnection = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("Database connected ✅");
    return true;
  } catch (err) {
    console.error("Database connection failed ❌");
    console.error(err.message);
    return false;
  }
};

module.exports = { pool, testConnection };