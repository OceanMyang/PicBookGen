import FileDatabase from "./database/fileDatabase";
import FileStorage from "./files/fileStorage";
import { DataNotFoundException, HttpException, InternalServerException } from "./utils/error.utils";

try {
	console.log(await FileStorage.createFile("f4b9e828-5ac0-49bf-ae23-4f86c1ecc27b"));
} catch (err) {
	console.log(err instanceof DataNotFoundException);
}
