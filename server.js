const {
  hostname,
  port, 
  PATH_INDEX,
  PATH_FILES
} = require('./config')

const express = require('express');
const app = express();
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

app.set('views', '.');
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

let files = [];

fs.readdir('./files', (err, data)=>{
  if (err) throw err;
  console.log(data);
  files = data;
})

app.get('/', (req, res)=>{
  const filenames = files.map((file)=>path.parse(file).name);

  res.render('index', {
    filenames: filenames
  }, (err, html)=>{
    if (err) console.log(err);
    res.send(html);
  });
})

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});