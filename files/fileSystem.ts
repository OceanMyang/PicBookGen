import { promises as fsp } from "fs";
import { join } from "path";
import { Stream } from "stream";
import { filesPath } from "./files.path";
import { AccessDeniedException, ConflictException, FileNotFoundException, InternalServerException, NotFoundException } from "../utils/error.utils";
import { uploadPath } from "../uploads/upload.path";

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
			await fsp.mkdir(join(filesPath, fileID, "images"));
			var fd = await fsp.open(join(filesPath, fileID, "index.html"), fsp.constants.O_CREAT);
			fd.close();
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

	static async uploadFile(fileID: string) {
		if (fileID.includes(".")) {
			throw new ConflictException("File", fileID);
		}

		try {
			await fsp.mkdir(join(filesPath, fileID));
			await fsp.mkdir(join(filesPath, fileID, "images"));
			await fsp.rename(join(uploadPath, fileID), join(filesPath, fileID, "index.html"));
			console.log(`File ${fileID} uploaded to server.`);
		} catch (err) {
			console.log(err);
			switch (err.code) {
				case "EEXIST":
					throw new ConflictException("File", fileID);
				case "EACCES":
					throw new AccessDeniedException(`no permission to upload file ${fileID} on server`);
				default:
					throw new InternalServerException("uploading the file");
			}
		}
	}

	static async uploadImage(fileID: string, imageID: string, ext?: string) {
		if (fileID.includes(".") || imageID.includes(".")) {
			throw new ConflictException("Image", imageID);
		}

		try {
			await fsp.access(join(filesPath, fileID, "images"));
			await fsp.rename(join(uploadPath, imageID), join(filesPath, fileID, "images", imageID + (ext ? ext : "")));
			console.log(`Image ${imageID} uploaded to server.`);
		} catch (err) {
			console.log(err.code);
			switch (err.code) {
				case "ENOENT":
					throw new FileNotFoundException("File", fileID);
				case "EEXIST":
					throw new ConflictException("Image", imageID);
				case "EACCES":
					throw new AccessDeniedException(`no permission to upload image ${imageID} on server`);
				default:
					throw new InternalServerException("uploading the image");
			}
		}
	}

	static async deleteUpload(filename: string) {
		if (filename.includes(".")) {
			throw new FileNotFoundException("File", filename);
		}

		try {
			await fsp.rm(join(uploadPath, filename));
			console.log(`Uploaded File ${filename} deleted from server permanently.`);
		} catch (err) {
			console.log(err);
			switch (err.code) {
				case "ENOENT":
					throw new NotFoundException("Uploaded File", filename);
				case "EACCES":
					throw new AccessDeniedException(`no permission to delete file ${filename} on server`);
				default:
					throw new InternalServerException("deleting the file");
			}
		}
	}
}