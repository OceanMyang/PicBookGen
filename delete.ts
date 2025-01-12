import FileDatabase from "./src/db/fileDatabase.js";
import FileSystem from "./src/sys/fileSystem.js";
import UserDatabase from "./src/db/userDatabase.js";

const args = process.argv;
if (args.length !== 3) {
  console.log("Usage: delete.ts <fileID>");
  console.log("Current argument count: " + args.length);
  process.exit(1);
}
else if (!args[2]) {
  console.log("No fileID provided");
  process.exit(1);
}


const userID = args[2];
await UserDatabase.deleteUser(userID);
Promise.all([
  async () => {
    const files = await FileDatabase.listFiles(userID);
    for (const file of files) {
      await FileSystem.deleteFile(file.fileid);
    }
  },
  UserDatabase.deleteUser(userID),
]).finally(() => process.exit(0));