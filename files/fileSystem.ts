import { promises as fsp } from "fs";

export default class FileSystem {
  static async readDir() {
    const files = await fsp.readdir(".");
    return files;
  }

  static async readFile(fileID: string) {
    const file = await fsp.readFile(fileID + "/index.html");
    return file;
  }

  static async createFile(fileID: string) {
    await fsp.mkdir(fileID);
    await fsp.writeFile(fileID + "/index.html", "");
    await fsp.mkdir(fileID + "/images");
  };
}