const { hostname, port, files_path, src_path } = require("./config");

const express = require("express");
const app = express();
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path"); 
const ejs = require('ejs');

app.set("views", path.join(__dirname, 'public', 'views'));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.route('/')
  .get(async (req, res) => {
    try {
      app.use('/src', express.static(src_path));
      const files = await fsp.readdir(files_path, "utf8");

      const exists = files.length !== 0;
      const header = exists ? "index" : "empty";
      let locals = {};
      locals.filenames = exists ? files : null;
    
      res.render(header, locals);
    } catch (err) {
      console.error(err);
      res.status(500).end('Can not read Files');
    }
  })

app.route('/edit/:filename')
  .get(async (req, res) => {
    const filename = req.params.filename;
    try {
      app.use(`/edit/${filename}`, express.static(path.join(files_path, filename)));
      app.use('/src', express.static(src_path));
      const file = await fsp.readFile(path.join(files_path, filename, 'index.html'), "utf-8");
      res.render('editor', {
        filename: filename,
        file: file
      });
    } catch (err) {
      console.error(err);
      res.status(404).end('File Not Found');
    }
    console.log("get");
  })
  .put(async (req, res) => {
    console.log(req)
    try {
      const file = req.body.file;
      console.log(file);
      if (file) {
        await fsp.writeFile(path.join(files_path, oldname));
        console.log("Write File Completed");
        res.send("Saved");
      }

      const oldname = req.params.filename;
      const newname = req.body.filename;
      console.log(newname);
      if (newname) {
        fs.rename(path.join(files_path, oldname), path.join(files_path, newname));
        console.log("Rename Completed");
        res.send("Renamed");
      }

      if (!file && !newname) {
        res.status(400).end('Bad Request');
      }
    } catch (err) {
      console.error(err);
      res.status(500).end('Unexpected Error in File Operations');
    }
  })

// app.post('/edit/:name', async (req, res) => {
//   const filename = req.body.filename;
//   const file = req.body.file;
//   if (file) {
//     fsp.mkdir(path.join(__dirname, 'public', 'files'))
//   }
// })

// app.get('*', async (req, res)=>{
//   res.render('error', (err, html)=>{
//     if (err) {
//       console.error(err);
//       res.status(500).end('Error Template Not Found');
//     }
//     res.send(html);
//   })
// })

process.on("uncaughtException", (err) => {
  console.error(err);
});

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
