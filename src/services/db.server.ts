const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function query(...args) {
  const client = await pool.connect();
  const result = await client.query(...args);

  client.release();

  return result.rows;
}
