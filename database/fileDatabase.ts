import mysql, { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { v4 as uuid } from 'uuid';

const con = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'files',
});

const createFilesTable = `\n
CREATE TABLE IF NOT EXISTS files (\n
fileID varchar(36) NOT NULL DEFAULT (UUID()),\n
name varchar(255) NOT NULL DEFAULT ('untitled'),\n
author varchar(255),\n
createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,\n
deletedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n
PRIMARY KEY(fileID)\n
);\n`;

export default class FileDatabase {
  static async init() {
    // Create table files if not exists
    con.query<ResultSetHeader>(createFilesTable)
      .then(([results, fields]) => {
        if (results.affectedRows === 0) {
          console.log("Table files already exists.");
        } else {
          console.log("Table files created.");
        }
      })
      .catch((err) => {
        console.log(err);
      })
  }

  // List all files (uuid) in the database
  static async listFiles(): Promise<string[]> {
    return con.query<RowDataPacket[]>("select fileID from files where deletedAt is null")
      .then(([results, fields]) => {
        return results.map((row) => row['fileID']);
      })
      .catch((err) => {
        console.log(err);
        return [];
      })
  }

  // List all files (uuid) and names in the database
  static async listFilesAndNames(): Promise<JSON[]> {
    return con.query<mysql.RowDataPacket[]>("select fileID, name from files where deletedAt is null")
      .then(([results, fields]) => {
        return JSON.parse(JSON.stringify(results));
      })
      .catch((err) => {
        console.log(err);
        return [];
      })
  }

  // Register a new file into the database and returns the file
  static async regisFile(
    name: string,
    author: string
  ): Promise<JSON> {
    var fileID: string = uuid();
    return con.query("insert into files (fileID, name, author) values (?, ?, ?)", [fileID, name, author])
      .then(async () => {
        var fileStats = await this.getFile(fileID);
        return JSON.parse(JSON.stringify(fileStats));
      })
      .catch((err) => {
        console.log(err);
        return null;
      })
  }

  // Find the file information for the client
  static async findFile(fileID: string): Promise<JSON> {
    return con.query<mysql.RowDataPacket[]>("select * from files where fileID = ? and deletedAt is null", [fileID])
      .then(([results, fields]) => {
        if (results.length === 0) {
          console.log(`File ${fileID} is not found.`);
          return null;
        }
        return JSON.parse(JSON.stringify(results[0]));
      })
      .catch((err) => {
        console.log(err);
        return null;
      })
  }

  // Rename a file and returns the renamed file
  static async renameFile(
    fileID: string,
    name: string,
  ): Promise<JSON | null> {
    if (await this.findFile(fileID)) {
      return con.query("update files set name = ? where fileID = ? and deletedAt is null", [name, fileID])
        .then(() => {
          console.log(`File ${fileID} renamed to ${name}.`);
          var fileStats = this.getFile(fileID);
          return JSON.parse(JSON.stringify(fileStats));
        })
        .catch((err) => {
          console.log(err);
          return null;
        })
    } else {
      console.log(`File ${fileID} is not found.`);
      return null;
    }
  }

  // Delete a file and returns the deleted file
  static async deleteFile(fileID: string): Promise<JSON | null> {
    if (await this.findFile(fileID)) {
      return con.query("update files set deletedAt = CURRENT_TIMESTAMP where fileID = ? and deletedAt is null", [fileID])
        .then(async () => {
          console.log(`File ${fileID} deleted.`);
          var fileStats = await this.getFile(fileID);
          return JSON.parse(JSON.stringify(fileStats));
        })
        .catch((err) => {
          console.log(err);
          return null;
        })
    } else {
      console.log(`File ${fileID} is not found.`);
      return null;
    }
  }

  // Get the file information even if it is deleted
  private static async getFile(fileID: string): Promise<JSON> {
    return con.query<mysql.RowDataPacket[]>("select * from files where fileID = ?", [fileID])
      .then(([results, fields]) => {
        if (results.length === 0) {
          console.log(`File ${fileID} is not found.`);
          return null;
        }
        return JSON.parse(JSON.stringify(results[0]));
      })
      .catch((err) => {
        console.log(err);
        return null;
      })
  }
}