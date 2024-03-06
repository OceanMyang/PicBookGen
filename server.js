const {
  hostname,
  port, 
  PATH_INDEX,
  PATH_FILES,
} = require('./config')

const express = require('express');
const app = express();
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

let files = [];
fs.readdir(PATH_FILES, (err, data)=>{
  if (err) throw err;
  console.log(data);
  files = data;
})

app.get('/', (req, res)=>{
  const filenames = files.map((file) => path.parse(file).name);
  console.log(filenames);
  
  res.render('index', {
    filenames: filenames
  }, (err, html)=>{
    if (err) throw (err);
    res.send(html);
  });
});

process.on('uncaughtException', err => {
  console.error('Error: ', err);
  process.exit(1);
})

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});