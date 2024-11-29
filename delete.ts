import FileDatabase from "./database/fileDatabase";
import FileSystem from "./files/fileSystem";

var args = process.argv;
if (args.length !== 3) {
  console.log("Usage: delete.ts <fileID>");
  console.log("Current argument count: " + args.length);
  process.exit(1);
}
else if (!args[2]) {
  console.log("No fileID provided");
  process.exit(1);
}

var fileID = args[2];
Promise.all([
  FileDatabase.deleteFile(fileID),
  FileSystem.deleteFile(fileID)
]).finally(() => process.exit(0));