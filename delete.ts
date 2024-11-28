import FileDatabase from "./database/fileDatabase";
import FileManager from "./files/fileManager";

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

try {
    var fileID = args[2];
    await FileDatabase.deleteFile(fileID);
    // await FileManager.deleteFile(fileID);
    process.exit(0);
} catch (err) {
    console.log(err);
    process.exit(1);
}