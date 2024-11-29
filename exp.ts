import FileDatabase from './database/fileDatabase';

console.log(await FileDatabase.listFiles());

process.exit(0);