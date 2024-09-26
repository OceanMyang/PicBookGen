const { join } = require("path");
const hostName = "127.0.0.1";
const port = process.env.PORT || 3000;
const _file = join(__dirname, "files");
const _public = join(__dirname, "public");

const express = require("express");
const app = express();
const fs = require("fs");
const fsp = require("fs").promises;

app.set("views", join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());

app.use("/", express.static(_public));
app.route("/").get(async (req, res) => {
  try {
    const fileNames = await fsp.readdir(_file, "utf8");

    const header = fileNames.length !== 0 ? "index" : "empty";
    let locals = {};
    locals.fileNames = fileNames.length !== 0 ? fileNames : null;

    res.render(header, locals);
  } catch (err) {
    console.error(err);
    res.status(500).end("Cannot get all files from server");
  }
});

app
  .route("/edit/:fileName")
  .get(async (req, res) => {
    const fileName = req.params.fileName;
    if (!fileName) {
      res.status(400).end("fileName is required in request");
    }

    app.use(`/edit/${fileName}`, express.static(join(_file, fileName)));

    try {
      const file = await fsp.readFile(
        join(_file, fileName, "index.html"),
        "utf-8"
      );
      res.render("editor", {
        fileName: fileName,
        file: file,
      });
    } catch (err) {
      console.error(err);
      clientErrPage(res, 404, "File Not Found");
    }
  })
  .post(async (req, res) => {
    let fileName = req.body.fileName;
    const file = req.body.file ? req.body.file : "";

    if (!fileName) {
      res.status(400).end("No fileName");
    }

    const fileNames = await fsp.readdir(_file, "utf8");
    while (fileNames.includes(fileName)) {
      fileName += "_1";
    }

    try {
      await fsp.mkdir(join(_file, fileName));
      await fsp.writeFile(join(_file, fileName, "index.html"), file);
      await fsp.mkdir(join(_file, fileName, "images"));
      console.log(`File ${fileName} Created.`);
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
    const oldName = req.params.fileName;
    const newName = req.body.fileName;

    try {
      if (c_file) {
        await fsp.writeFile(join(_file, oldName, "index.html"), c_file);
        console.log("Write File Completed. File Content:", c_file);
        res.send("Saved");
      }
      if (newName) {
        await fsp.rename(join(_file, oldName), join(_file, newName));
        console.log(
          `Rename Completed. Old Name: ${oldName} New Name: ${newName}`
        );
        res.send("Renamed").redirect(`/edit/${newName}`);
      }
    } catch (err) {
      console.error(err);
      res.status(500).end("Error in File Operations");
    }
  });

app.get("*", async (req, res) => {
  console.error("Page Not Found");
  clientErrPage(res, 404, "Page Not Found");
});

const clientErrPage = (res, errCode, errMsg) => {
  res.status(errCode).render(
    "error",
    {
      message: errMsg,
    },
    (err, html) => {
      if (err) {
        console.error(err);
        res.status(500).end("Error Page Not Found");
      }
      res.send(html);
    }
  );
};

process.on("uncaughtException", (err) => {
  console.error(err);
});

app.listen(port, () => {
  console.log(`Server running at http://${hostName}:${port}/`);
});
