import dotenv from 'dotenv';
import pg from 'pg';
import { userTransformer } from 'src/helpers/userTransformer.js';
import { InternalServerException, NotFoundException } from 'src/utils/error.util.js';
const { Pool } = pg;

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(".env file is not found or DATABASE_URL is not set in .env file.");
}

const pool = new Pool({
  connectionString,
});

export default class UserDatabase {
  static async registerUser(userid: string, email: string, password_hash: string): Promise<void> {
    await pool.query("insert into users (userid, email, password_hash) values ($1, $2, $3);", [userid, email, password_hash])
      .catch((err) => {
        console.log(err);
        throw new InternalServerException("registering a new user");
      })
  }

  static async listUsers(): Promise<UserData[]> {
    return await pool.query("select * from users;")
      .then(({ rows }) => rows.map(userTransformer))
      .catch((err) => {
        console.log(err);
        return [];
      })
  }

  static async getUserByID(userID: string): Promise<UserData | null> {
    return await pool.query("select * from users where userid::text = $1;", [userID])
      .then(({ rows }) => {
        if (rows.length === 0) {
          return null;
        }
        return userTransformer(rows[0]);
      })
      .catch((err) => {
        console.log(err);
        return null;
      })
  }

  static async getUserByEmail(email: string): Promise<UserData | null> {
    return await pool.query("select * from users where email = $1;", [email])
      .then(({ rows }) => {
        if (rows.length === 0) {
          return null;
        }
        return userTransformer(rows[0]);
      })
      .catch((err) => {
        console.log(err);
        return null;
      })
  }

  /** This action will also delete all the files in database related to this user */
  static async deleteUser(userID: string): Promise<void> {
    await pool.query("delete from users where userid::text = $1;", [userID])
      .catch((err) => {
        console.log(err);
        throw new InternalServerException("deleting the user");
      })
  }
}