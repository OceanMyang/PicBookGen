const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;

const hostname = '127.0.0.1';
const port = process.env.PORT || 3000;
const PATH_INDEX = path.join(__dirname, 'src', 'views', 'index.html');
const PATH_FILES = path.join(__dirname, 'public', 'files')

const readdirAsync = (path) => {
    let files = [];
    (async () => {
    const data = await fsp.readdir(path)
    files = data;
    })();
    return files;
}

const readFileAsync = (path) => {
    let file = null;
    (async () => {
        const data = await fsp.readFile(path)
        file = data;
    })()
    return file;
}

module.exports = {
    hostname,
    port,
    PATH_INDEX,
    PATH_FILES,
}