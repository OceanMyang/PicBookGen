import { promises as fsp } from "fs";
import { join } from "path";
import { jsPath } from "./js.path";
import { AccessDeniedException, FileNotFoundException, InternalServerException } from "../../utils/error.utils";

export default class ScriptManager {
    static async readDir(dir = ""): Promise<string[]> {
        try {
            var dirEnts = await fsp.readdir(join(jsPath, dir));
            return dirEnts.filter((ent) => ent.endsWith(".js"));
        } catch (err) {
            console.log(err);
            throw new InternalServerException("getting the scripts from server");
        }
    }
    
    static async readFile(dirName: string = "", scriptName: string): Promise<Buffer> {
        try {
            return await fsp.readFile(join(jsPath, dirName, scriptName));
        } catch (err) {
            console.log(err);
            switch (err.code) {
				case "ENOENT":
					throw new FileNotFoundException("Script", scriptName);
				case "EACCES":
					throw new AccessDeniedException(`no permission to read script ${scriptName} on server`);
				default:
					throw new InternalServerException("fetching the scripts");
			}
        }
    }
}