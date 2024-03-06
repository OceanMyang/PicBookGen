const path = require('path');

const hostname = '127.0.0.1';
const port = process.env.PORT || 3000;
const PATH_INDEX = path.join(__dirname, 'index.html');
const PATH_FILES = path.join(__dirname, 'files')

module.exports = {
    hostname,
    port,
    PATH_INDEX,
    PATH_FILES,
}