import FileDatabase from "./src/db/fileDatabase.js";
import FileSystem from "./src/sys/fileSystem.js";

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

const fileID = args[2];
Promise.all([
  FileDatabase.deleteFile(fileID),
  FileSystem.deleteFile(fileID)
]).finally(() => process.exit(0));