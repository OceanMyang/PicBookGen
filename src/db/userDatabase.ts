import { userTransformer } from 'src/helpers/userTransformer.js';
import { InternalServerException } from 'src/utils/error.util.js';
import pool from './pool.js';

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
        throw new InternalServerException("getting the user");
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
        throw new InternalServerException("getting the user");
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