const { hostname, port, files_path, src_path } = require("./config");

const express = require("express");
const app = express();
const fs = require("fs");
const fsp = require("fs").promises;
const { join } = require("path");

app.set("views", join(__dirname, "public", "views"));
app.set("view engine", "ejs");
app.use(express.json());

app.use("/src", express.static(src_path));
app.route("/").get(async (req, res) => {
  try {
    const filenames = await fsp.readdir(files_path, "utf8");

    const exists = filenames.length !== 0;
    const header = exists ? "index" : "empty";
    let locals = {};
    locals.filenames = exists ? filenames : null;

    res.render(header, locals);
  } catch (err) {
    console.error(err);
    res.status(500).end("Cannot get all files from server");
  }
});

app
  .route("/edit/:filename")
  .get(async (req, res) => {
    const filename = req.params.filename;
    if (!filename) {
      res.status(400).end("Filename is required in request");
    }
    try {
      app.use(`/edit/${filename}`, express.static(join(files_path, filename)));
      const file = await fsp.readFile(
        join(files_path, filename, "index.html"),
        "utf-8"
      );
      res.render("editor", {
        filename: filename,
        file: file,
      });
    } catch (err) {
      console.error(err);
      clientErrPage(res, 404, "File Not Found");
    }
  })
  .post(async (req, res) => {
    let filename = req.body.filename;
    const file = req.body.file ? req.body.file : "";

    if (!filename) {
      res.status(400).end("No FileName");
    }

    const filenames = await fsp.readdir(files_path, "utf8");
    while (filenames.includes(filename)) {
      filename += "_1";
    }

    try {
      await fsp.mkdir(join(files_path, filename));
      await fsp.writeFile(join(files_path, filename, "index.html"), file);
      await fsp.mkdir(join(files_path, filename, "images"));
      console.log(`File ${filename} Created.`);
      res.redirect("/");
    } catch (err) {
      console.error(err);
      res.status(500).end("Create File Error");
    }
  })
  .put(async (req, res) => {
    if (!req.body || req.body == {}) {
      res.status(400).end("Put request doesn't have a body");
    }

    const c_file = req.body.file.replace(/\t/g, "").replace(/\n/g, "");
    const oldname = req.params.filename;
    const newname = req.body.filename;

    try {
      if (c_file) {
        await fsp.writeFile(join(files_path, oldname, "index.html"), c_file);
        console.log("Write File Completed. File Content:", c_file);
        res.send("Saved");
      }
      if (newname) {
        await fsp.rename(join(files_path, oldname), join(files_path, newname));
        console.log(
          `Rename Completed. Old Name: ${oldname} New Name: ${newname}`
        );
        res.send("Renamed").redirect(`/edit/${newname}`);
      }
    } catch (err) {
      console.error(err);
      res.status(500).end("Error in File Operations");
    }
  });

// app.post('/edit/:name', async (req, res) => {
//   const filename = req.body.filename;
//   const file = req.body.file;
//   if (file) {
//     fsp.mkdir(join(__dirname, 'public', 'files'))
//   }
// })

app.get("*", async (req, res) => {
  console.error("Page Not Found");
  clientErrPage(res, 404, "Page Not Found");
});

const clientErrPage = (res, errCode, errMsg) => {
  res.status(errCode).render("error", (err, html) => {
    if (err) {
      console.error(err);
      res.status(500).end("Error Template Not Found");
    }
    res.send(html);
  });
};

process.on("uncaughtException", (err) => {
  console.error(err);
});

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
