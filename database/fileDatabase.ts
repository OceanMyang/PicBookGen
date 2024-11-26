import mysql, { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { v4 as uuid } from 'uuid';
import { DataNotFoundException, DeletedException, InternalServerException } from '../utils/error.utils';

const con = await mysql.createConnection({
  host: 'localhost',
  user: 'user',
  password: 'gl4572d2z',
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
  /**
   * Initializes the database by creating the "files" table if it does not already exist.
   * 
   * This method executes an SQL query to create the "files" table. If the table already exists,
   * it logs a message indicating that the table already exists. If the table is created successfully,
   * it logs a message indicating that the table was created. If there is an error during the execution
   * of the query, it logs the error.
   * 
   * @returns {Promise<void>} A promise that resolves when the initialization is complete.
   */
  static async createTable(): Promise<void> {
    await con.query<ResultSetHeader>(createFilesTable)
      .then(([results, fields]) => {
        if (results.affectedRows === 0) {
          console.log("Table files already exists.");
        } else {
          console.log("Table files created.");
        }
      })
      .catch((err) => {
        console.log(err);
        throw new InternalServerException("initializing the database");
      })
  }

  /**
   * Retrieves a list of file IDs from the "files" table where the files have not been marked as deleted.
   * 
   * This method executes an SQL query to select the file IDs from the "files" table where the `deletedAt` 
   * column is null. It returns a promise that resolves to an array of file IDs. If there is an error 
   * during the execution of the query, it logs the error and returns an empty array.
   * 
   * @returns {Promise<string[]>} A promise that resolves to an array of file IDs.
   */
  static async listFiles(): Promise<string[]> {
    return await con.query<RowDataPacket[]>("select fileID from files where deletedAt is null")
      .then(([results, fields]) => {
        return results.map((row) => row['fileID']);
      })
      .catch((err) => {
        console.log(err);
        return [];
      })
  }

  /**
   * Retrieves a list of file IDs and names from the "files" table where the files have not been marked as deleted.
   * 
   * This method executes an SQL query to select the file IDs and names from the "files" table where the `deletedAt` 
   * column is null. It returns a promise that resolves to an array of JSON objects representing the file IDs and names.
   * If there is an error during the execution of the query, it logs the error and returns an empty array.
   * 
   * @returns {Promise<JSON[]>} A promise that resolves to an array of JSON objects containing file IDs and names.
   */
  static async listFilesAndNames(): Promise<JSON[]> {
    return await con.query<mysql.RowDataPacket[]>("select fileID, name from files where deletedAt is null")
      .then(([results, fields]) => {
        return JSON.parse(JSON.stringify(results));
      })
      .catch((err) => {
        console.log(err);
        return [];
      })
  }

  /**
   * Registers a new file into the database and returns the file data.
   * 
   * This method generates a unique file ID and inserts a new record into the "files" table with the provided
   * name and author. After inserting the record, it retrieves the file data using the `findFileAdmin` method
   * and returns it as a JSON object. If there is an error during the execution of the query, it logs the error
   * and throws an `InternalServerException`.
   * 
   * @param {string} name - The name of the file to be registered.
   * @param {string} author - The author of the file to be registered.
   * @returns {Promise<JSON>} A promise that resolves to a JSON object containing the file data.
   * @throws {InternalServerException} If an unexpected error occurs while registering the new file.
   */
  static async enterFile(
    name: string,
    author: string | null = null
  ): Promise<JSON> {
    var fileID: string = uuid();

    return await con.query("insert into files (fileID, name, author) values (?, ?, ?)", [fileID, name, author])
      .then(async () => {
        console.log(`File ${fileID} created in database.`);
        var fileData = await this.getFile(fileID);
        return JSON.parse(JSON.stringify(fileData));
      })
      .catch((err) => {
        console.log(err);
        throw new InternalServerException("registering a new file");
      })
  }

  /**
   * Finds a file in the database by its file ID.
   * 
   * This method executes an SQL query to select all columns from the "files" table where the `fileID` matches
   * the provided file ID and the `deletedAt` column is null. It returns a promise that resolves to a JSON object
   * containing the file data. If the file is not found or has been marked as deleted, it throws appropriate exceptions.
   * If there is an error during the execution of the query, it logs the error and throws an `InternalServerException`.
   * 
   * @param {string} fileID - The ID of the file to be found.
   * @returns {Promise<JSON>} A promise that resolves to a JSON object containing the file data.
   * @throws {DataNotFoundException} If the file is not found.
   * @throws {DeletedException} If the file has been marked as deleted.
   * @throws {InternalServerException} If an unexpected error occurs while searching for the file.
   */
  static async findFile(fileID: string): Promise<JSON> {
    var fileData = await this.getFile(fileID);

    if (!fileData) {
      throw new DataNotFoundException("File", fileID);
    }

    if (fileData['deletedAt']) {
      throw new DeletedException("File", fileID);
    }

    return fileData;
  }

  /**
   * Renames a file in the database by its file ID.
   * 
   * This method first checks if the file exists and is not marked as deleted by calling the `findFileAdmin` method.
   * If the file is not found or is marked as deleted, it throws appropriate exceptions. It then executes an SQL query 
   * to update the name of the file in the "files" table where the `fileID` matches the provided file ID. After renaming 
   * the file, it retrieves the updated file data using the `findFileAdmin` method and returns it as a JSON object. If 
   * there is an error during the execution of the query, it logs the error and throws an `InternalServerException`.
   * 
   * @param {string} fileID - The ID of the file to be renamed.
   * @param {string} name - The new name for the file.
   * @returns {Promise<JSON | null>} A promise that resolves to a JSON object containing the updated file data, or null if the file is not found.
   * @throws {DataNotFoundException} If the file is not found.
   * @throws {DeletedException} If the file has been marked as deleted.
   * @throws {InternalServerException} If an unexpected error occurs while renaming the file.
   */
  static async renameFile(
    fileID: string,
    name: string,
  ): Promise<JSON | null> {
    var fileData = await this.getFile(fileID);

    if (!fileData) {
      throw new DataNotFoundException("File", fileID);
    }

    if (fileData['deletedAt']) {
      throw new DeletedException("File", fileID);
    }

    return await con.query("update files set name = ? where fileID = ?", [name, fileID])
      .then(async () => {
        console.log(`File ${fileID} (name: ${fileData['name']}) renamed to ${name} in database.`);
        fileData = await this.getFile(fileID);
        return JSON.parse(JSON.stringify(fileData));
      })
      .catch((err) => {
        console.log(err);
        throw new InternalServerException("renaming the file");
      })
  }

  /**
   * Marks a file as deleted in the database by its file ID.
   * 
   * This method first checks if the file exists and is not already marked as deleted by calling the `findFileAdmin` method.
   * If the file is not found or is marked as deleted, it throws appropriate exceptions. It then executes an SQL query 
   * to update the `deletedAt` column of the file in the "files" table to the current timestamp. After marking the file 
   * as deleted, it retrieves the updated file data using the `findFileAdmin` method and returns it as a JSON object. 
   * If there is an error during the execution of the query, it logs the error and throws an `InternalServerException`.
   * 
   * @param {string} fileID - The ID of the file to be marked as deleted.
   * @returns {Promise<JSON | null>} A promise that resolves to a JSON object containing the updated file data, or null if the file is not found.
   * @throws {DataNotFoundException} If the file is not found.
   * @throws {DeletedException} If the file has been marked as deleted.
   * @throws {InternalServerException} If an unexpected error occurs while deleting the file.
   */
  static async archiveFile(fileID: string): Promise<JSON | null> {
    var fileData = await this.getFile(fileID);

    if (!fileData) {
      throw new DataNotFoundException("File", fileID);
    }

    if (fileData['deletedAt']) {
      throw new DeletedException("File", fileID);
    }

    return await con.query("update files set deletedAt = CURRENT_TIMESTAMP where fileID = ?", [fileID])
      .then(async () => {
        console.log(`File ${fileID} archived in database.`);
        fileData = await this.getFile(fileID);
        return JSON.parse(JSON.stringify(fileData));
      })
      .catch((err) => {
        console.log(err);
        throw new InternalServerException("deleting the file");
      })
  }

  static async deleteFile(fileID: string): Promise<JSON | null> {
    var fileData = await this.getFile(fileID);

    if (!fileData) {
      throw new DataNotFoundException("File", fileID);
    }

    return await con.query("delete from files where fileID = ?", [fileID])
      .then(async () => {
        console.log(`File ${fileID} deleted from the database by admin.`);
        return JSON.parse(JSON.stringify(fileData));
      })
      .catch((err) => {
        console.log(err);
        throw new InternalServerException("deleting the file");
      })
  }

  /**
   * Finds a file in the database by its file ID, including deleted files.
   * 
   * This method executes an SQL query to select all columns from the "files" table where the `fileID` matches
   * the provided file ID. It returns a promise that resolves to a JSON object containing the file data. If the 
   * file is not found, it logs a message and returns null. If there is an error during the execution of the query, 
   * it logs the error and returns null.
   * 
   * @param {string} fileID - The ID of the file to be found.
   * @returns {Promise<JSON | null>} A promise that resolves to a JSON object containing the file data, or null if the file is not found.
   */
  private static async getFile(fileID: string): Promise<JSON> {
    return await con.query<mysql.RowDataPacket[]>("select * from files where fileID = ?", [fileID])
      .then(([results, fields]) => {
        if (results.length === 0) {
          console.log(`File ${fileID} does not exist in database.`);
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