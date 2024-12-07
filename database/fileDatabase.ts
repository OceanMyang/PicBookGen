import { validate } from 'uuid';
import { DataNotFoundException, DeletedException, InternalServerException } from '../utils/error.utils';

import pg from 'pg';
const { Pool } = pg;
const connectionString = 'postgresql://postgres.jpfmecydsiiscddxoopg:sbgl4572d2z@aws-0-us-east-1.pooler.supabase.com:6543/postgres';
const pool = new Pool({
  connectionString,
});

await pool.connect();
console.log("Connected to database");

export default class FileDatabase {
  static async listFiles(): Promise<JSON[]> {
    return await pool.query("select * from files where deletedat is null;")
      .then(({ rows }) => rows)
      .catch((err) => {
        console.log(err);
        return [];
      })
  }

  static async listArchivedFiles(): Promise<JSON[]> {
    return await pool.query("select * from files where deletedat is not null;")
      .then(({ rows }) => rows)
      .catch((err) => {
        console.log(err);
        return [];
      })
  }

  static async enterFile(
    fileID: string,
    name: string,
    author: string = "test"
  ): Promise<JSON> {
    if (!validate(fileID)) {
      throw new InternalServerException("generating a new file ID");
    }

    return await pool.query("insert into files (fileid, name, author) values ($1::uuid, $2, $3) returning *;", [fileID, name, author])
      .then(async ({ rows }) => {
        if (rows.length === 0) {
          throw new InternalServerException("entering a new file");
        }
        return rows[0];
      })
      .catch((err) => {
        console.log(err);
        throw new InternalServerException("entering a new file");
      })
  }

  static async findFile(fileID: string): Promise<JSON> {
    var fileData = await this.getFile(fileID);

    if (!fileData) {
      throw new DataNotFoundException("File", fileID);
    }

    if (fileData['deletedat']) {
      throw new DeletedException("File", fileID);
    }

    return fileData;
  }

  static async renameFile(
    fileID: string,
    name: string,
  ): Promise<JSON> {
    var oldData = await this.getFile(fileID);

    if (!oldData) {
      throw new DataNotFoundException("File", fileID);
    }

    if (oldData['deletedat']) {
      throw new DeletedException("File", fileID);
    }

    return await pool.query("update files set name = $1 where fileID::text = $2 returning *;", [name, fileID])
      .then(async ({ rows }) => {
        if (rows.length === 0) {
          throw new InternalServerException("renaming the file");
        }
        var newData = rows[0];
        console.log(`File ${fileID} renamed from ${oldData['name']} to ${newData['name']} in database.`);
        return newData;
      })
      .catch((err) => {
        console.log(err);
        throw new InternalServerException("renaming the file");
      })
  }

  static async archiveFile(fileID: string): Promise<JSON> {
    var oldData = await this.getFile(fileID);

    if (!oldData) {
      throw new DataNotFoundException("File", fileID);
    }

    if (oldData['deletedat']) {
      throw new DeletedException("File", fileID);
    }

    return await pool.query("update files set deletedat = CURRENT_TIMESTAMP where fileID::text = $1 returning *;", [fileID])
      .then(async ({ rows }) => {
        if (rows.length === 0) {
          throw new InternalServerException("deleting the file");
        }
        console.log(`File ${fileID} archived in database.`);
        return rows[0];
      })
      .catch((err) => {
        console.log(err);
        throw new InternalServerException("deleting the file");
      })
  }

  static async restoreFile(fileID: string): Promise<JSON> {
    var oldData = await this.getFile(fileID);

    if (!oldData) {
      throw new DataNotFoundException("File", fileID);
    }

    if (!oldData['deletedat']) {
      throw new DeletedException("File", fileID, false);
    }

    return await pool.query("update files set deletedat = null where fileID::text = $1 returning *;", [fileID])
      .then(async ({ rows }) => {
        if (rows.length === 0) {
          throw new InternalServerException("restoring the file");
        }
        console.log(`File ${fileID} restored in database.`);
        return rows[0];
      })
      .catch((err) => {
        console.log(err);
        throw new InternalServerException("restoring the file");
      })
  }

  static async deleteFile(fileID: string): Promise<JSON> {
    if (!validate(fileID)) {
      throw new DataNotFoundException("File", fileID);
    }

    var fileData = await this.getFile(fileID);

    if (!fileData) {
      throw new DataNotFoundException("File", fileID);
    }

    if (!fileData['deletedat']) {
      throw new DeletedException("File", fileID, false);
    }

    return await pool.query("delete from files where fileID::text = $1;", [fileID])
      .then(async () => {
        console.log(`File ${fileID} deleted from the database permanently.`);
        return fileData;
      })
      .catch((err) => {
        console.log(err);
        throw new InternalServerException("deleting the file");
      })
  }

  private static async getFile(fileID: string): Promise<JSON> {
    return await pool.query("select * from files where fileID::text = $1;", [fileID])
      .then(async ({ rows }) => {
        if (rows.length === 0) {
          console.log(`File ${fileID} does not exist in database.`);
          return {};
        }
        return rows[0];
      })
      .catch((err) => {
        console.log(err);
        throw new InternalServerException("getting the file");
      })
  }
}