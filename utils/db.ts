import { Pool } from "pg";

let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_DATABASE || "inneparkert",
      port: parseInt(process.env.DB_PORT || "5432"),
    });
  }
  return pool;
}

export async function query(text: string, params: any[] = []) {
  const pool = getPool();
  try {
    const result = await pool?.query(text, params);
    return result;
  } catch (error) {
    console.error("Error querying the database: ", error);
    throw error;
  }
}
