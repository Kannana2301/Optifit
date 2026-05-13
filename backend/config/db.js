const mysql = require("mysql2/promise");

const rootPool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "5533",
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0
});

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "5533",
  database: process.env.DB_NAME || "optifit",
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0
});

async function ensureDatabase() {
  await rootPool.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || "optifit"}\``);
}

module.exports = { db, ensureDatabase };
