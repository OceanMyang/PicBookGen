import { promises as fsp } from "fs";
import { join } from "path";
import { Stream } from "stream";
import { filesPath } from "./files.path";
import { AccessDeniedException, ConflictException, FileNotFoundException, InternalServerException } from "../utils/error.utils";

export default class FileSystem {
	static async readDir(): Promise<string[]> {
		try {
			var dirEnts = await fsp.readdir(filesPath, { withFileTypes: true });
			return dirEnts.filter((ent) => ent.isDirectory()).map((ent) => ent.name);
		} catch (err) {
			console.log(err);
			throw new InternalServerException("reading the files directory on server");
		}
	}

	static async createFile(fileID: string) {
		if (fileID.includes(".")) {
			throw new InternalServerException("creating the file on server");
		}

		try {
			await fsp.mkdir(join(filesPath, fileID));
			await fsp.writeFile(join(filesPath, fileID, "index.html"), "");
			await fsp.mkdir(join(filesPath, fileID, "images"));
			console.log(`File ${fileID} created on server.`);
		} catch (err) {
			console.log(err);
			switch (err.code) {
				case "EEXIST":
					throw new ConflictException("File", fileID);
				case "EACCES":
					throw new AccessDeniedException(`no permission to create file ${fileID} on server`);
				default:
					throw new InternalServerException("creating the file on server");
			}
		}
	};

	static async readFile(fileID: string): Promise<Buffer> {
		if (fileID.includes(".")) {
			throw new FileNotFoundException("File", fileID);
		}

		try {
			return await fsp.readFile(join(filesPath, fileID, "index.html"));
		} catch (err) {
			console.log(err);
			switch (err.code) {
				case "ENOENT":
					throw new FileNotFoundException("File", fileID);
				case "EACCES":
					throw new AccessDeniedException(`no permission to read file ${fileID} on server`);
				default:
					throw new InternalServerException("reading the file");
			}
		}
	}

	static async writeFile(fileID: string, data: string | Buffer | Stream) {
		if (fileID.includes(".")) {
			throw new FileNotFoundException("File", fileID);
		}

		try {
			await fsp.writeFile(join(filesPath, fileID, "index.html"), data);
			console.log(`File ${fileID} updated on server.`);
		} catch (err) {
			console.log(err);
			switch (err.code) {
				case "ENOENT":
					throw new FileNotFoundException("File", fileID);
				case "EACCES":
					throw new AccessDeniedException(`no permission to write file ${fileID} on server`);
				default:
					throw new InternalServerException("writing the file");
			}
		}
	}

	static async deleteFile(fileID: string) {
		if (fileID.includes(".")) {
			throw new FileNotFoundException("File", fileID);
		}

		try {
			await fsp.rm(join(filesPath, fileID), { recursive: true });
			console.log(`File ${fileID} deleted from server permanently.`);
		} catch (err) {
			console.log(err);
			switch (err.code) {
				case "ENOENT":
					throw new FileNotFoundException("File", fileID);
				case "EACCES":
					throw new AccessDeniedException(`no permission to delete file ${fileID} on server`);
				default:
					throw new InternalServerException("deleting the file");
			}
		}
	}
}