const { hostname, port, PATH_INDEX, PATH_FILES } = require("./config");

const express = require("express");
const app = express();
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");

app.set("views", "./views");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  const files = await fsp.readdir(PATH_FILES, "utf-8");
  const filenames = files.map((file) => path.parse(file).name);

  const exists = files.length !== 0;
  const header = exists ? "index" : "empty";
  let locals = {};
  locals.filenames = exists ? filenames : null;

  res.render(header, locals, (err, html) => {
    if (err) throw err;
    res.send(html);
  });
});

app.get("/:name", async (req, res) => {
  const filename = req.params.name;
  const filepath = path.join(__dirname, "public", "files", `${filename}.html`);
  const scriptpath = path.join(__dirname, "public", "js", `editor.js`);

  let header = '';
  let locals = {};

  try {
    const file = await fsp.readFile(filepath, "utf-8");
    console.log(file);
    const script = await fsp.readFile(scriptpath, "utf-8");
    console.log(script);

    header = 'editor';
    locals.file = file;
    locals.script = "<script>\n" + script + "\n</script>";
  } catch (err) {
    header = 'error';
    file = '404 File Not Found';
    throw err;
  }
  
  res.render(
    header,
    locals,
    (err, html) => {
      if (err) throw err;
      res.send(html);
    }
  );
});

process.on("uncaughtException", (err) => {
  console.error(err);
});

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
