const { hostname, port, PATH_INDEX, PATH_FILES, PATH_SRC } = require("./config");

const express = require("express");
const app = express();
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path"); 
const ejs = require('ejs');

app.set("views", "./views");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
  const files = await fsp.readdir(PATH_FILES, "utf-8");

  const exists = files.length !== 0;
  const header = exists ? "index" : "empty";
  let locals = {};
  locals.filenames = exists ? files : null;
  
  app.use('/src', express.static(path.join(__dirname, 'public', 'src')));
  res.render(header, locals, (err, html) => {
    if (err) throw err;
    res.send(html);
  });
})

app.get('/edit/:name', async (req, res)=>{
  const filename = req.params.name;
  app.use(`/edit/${filename}`, express.static(path.join(__dirname, 'public', 'files', filename)));
  app.use('/src', express.static(path.join(__dirname, 'public', 'src')));
  try {
    const file = await fsp.readFile(path.join(__dirname, 'public', 'files', `${filename}`, 'index.html'), "utf-8");
    res.render('editor', {
      file: file
    })
  } catch (err) {
    file = 'File Not Found';
    console.error(err);
    res.status(404).end('File Not Found');
  }
})

process.on("uncaughtException", (err) => {
  console.error(err);
});

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
