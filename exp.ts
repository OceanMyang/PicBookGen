import { v4 } from 'uuid';
import FileDatabase from './database/fileDatabase';

var uuid = v4();

var fileData = await FileDatabase.enterFile(uuid, "test")
console.log(uuid, fileData['fileid']);

process.exit(0);