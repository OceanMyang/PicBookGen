import { validate } from 'uuid';
import {
  DataNotFoundException,
  DeletedException,
  InternalServerException
} from '../utils/error.util.js';
import pg from 'pg';
import dotenv from 'dotenv';
import { filesTransformer, fileTransformer } from '../helpers/fileTransformer.js';

dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in .env file.");
}

const pool = new Pool({
  connectionString,
});

pool.connect();
console.log("Connected to database");

export default class FileDatabase {
  static async listFiles(): Promise<FileData[]> {
    return await pool.query("select * from files where deletedat is null;")
      .then(({ rows }) => filesTransformer(rows))
      .catch((err) => {
        console.log(err);
        return [];
      })
  }

  static async listArchivedFiles(): Promise<FileData[]> {
    return await pool.query("select * from files where deletedat is not null;")
      .then(({ rows }) => filesTransformer(rows))
      .catch((err) => {
        console.log(err);
        return [];
      })
  }

  static async enterFile(
    fileID: string,
    name: string,
    author: string = "anon",
  ): Promise<FileData> {
    if (!validate(fileID)) {
      throw new InternalServerException("generating a new file ID");
    }

    return await pool.query("insert into files (fileid, name, author) values ($1::uuid, $2, $3) returning *;", [fileID, name, author])
      .then(async ({ rows }) => {
        if (rows.length === 0) {
          throw new InternalServerException("entering a new file");
        }
        return fileTransformer(rows[0]);
      })
      .catch((err) => {
        console.log(err);
        throw new InternalServerException("entering a new file");
      })
  }

  static async findFile(fileID: string): Promise<FileData> {
    var json = await this.getJSON(fileID);

    var file = fileTransformer(json);

    return file;
  }

  static async renameFile(
    fileID: string,
    name: string,
  ): Promise<FileData> {
    var json = await this.getJSON(fileID);

    var oldFile = fileTransformer(json);
    if (oldFile.deletedat) {
      throw new DeletedException("File", fileID);
    }

    return await pool.query("update files set name = $1 where fileID::text = $2 returning *;", [name, fileID])
      .then(async ({ rows }) => {
        if (rows.length === 0) {
          throw new InternalServerException("renaming the file");
        }
        var newFile = fileTransformer(rows[0]);
        console.log(`File ${fileID} renamed from ${oldFile.name} to ${newFile.name} in database.`);
        return newFile;
      })
      .catch((err) => {
        console.log(err);
        throw new InternalServerException("renaming the file");
      })
  }

  static async archiveFile(fileID: string): Promise<FileData> {
    var json = await this.getJSON(fileID);

    var oldFile = fileTransformer(json);

    if (oldFile.deletedat) {
      throw new DeletedException("File", fileID);
    }

    return await pool.query("update files set deletedat = CURRENT_TIMESTAMP where fileID::text = $1 returning *;", [fileID])
      .then(async ({ rows }) => {
        if (rows.length === 0) {
          throw new InternalServerException("deleting the file");
        }
        console.log(`File ${fileID} archived in database.`);
        return fileTransformer(rows[0]);
      })
      .catch((err) => {
        console.log(err);
        throw new InternalServerException("deleting the file");
      })
  }

  static async restoreFile(fileID: string): Promise<FileData> {
    var json = await this.getJSON(fileID);

    var oldFile = fileTransformer(json);

    if (!oldFile.deletedat) {
      throw new DeletedException("File", fileID, false);
    }

    return await pool.query("update files set deletedat = null where fileID::text = $1 returning *;", [fileID])
      .then(async ({ rows }) => {
        if (rows.length === 0) {
          throw new InternalServerException("restoring the file");
        }
        console.log(`File ${fileID} restored in database.`);
        return fileTransformer(rows[0]);
      })
      .catch((err) => {
        console.log(err);
        throw new InternalServerException("restoring the file");
      })
  }

  static async deleteFile(fileID: string): Promise<FileData> {
    if (!validate(fileID)) {
      throw new DataNotFoundException("File", fileID);
    }

    var json = await this.getJSON(fileID);

    var file = fileTransformer(json);

    if (!file.deletedat) {
      throw new DeletedException("File", fileID, false);
    }

    return await pool.query("delete from files where fileID::text = $1;", [fileID])
      .then(async () => {
        console.log(`File ${fileID} deleted from the database permanently.`);
        return file;
      })
      .catch((err) => {
        console.log(err);
        throw new InternalServerException("deleting the file");
      })
  }

  private static async getJSON(fileID: string): Promise<JSON> {
    return await pool.query("select * from files where fileID::text = $1;", [fileID])
      .then(async ({ rows }) => {
        if (rows.length === 0) {
          console.log(`File ${fileID} does not exist in database.`);
          throw new DataNotFoundException("File", fileID);
        }
        return rows[0];
      })
      .catch((err) => {
        if (err instanceof DataNotFoundException) {
          throw err;
        }
        console.log(err);
      })
  }
}