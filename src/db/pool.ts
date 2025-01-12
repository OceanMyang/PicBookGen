import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(".env file is not found or DATABASE_URL is not set in .env file.");
}

const pool = new Pool({
  connectionString,
});


pool.connect();
console.log("Connected to database");

export default pool;