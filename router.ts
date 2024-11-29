import express, { json, Response, Request, ErrorRequestHandler, NextFunction } from "express";
import { join, parse } from "path";
import { v4, validate } from "uuid";
import FileDatabase from "./database/fileDatabase";
import FileSystem from "./files/fileSystem";
import { BadRequestException, DataNotFoundException, FileNotFoundException, HttpException, InternalServerException, NotFoundException } from "./utils/error.utils";
import { resPath } from "./frontend/res/res.path";
import { viewPath } from "./frontend/views/view.path";
import { cssPath } from "./frontend/css/css.path";
import { jsPath } from "./frontend/js/js.path";
import { required } from "./frontend/js/js.required";

const router = express();
const port = process.env.PORT || 3000;
const handlerError = "Error in ErrorHandler";

router.set("views", viewPath);
router.set("view engine", "ejs");
router.use(json());
router.use("/css", express.static(cssPath));
router.use("/res", express.static(resPath));

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    res.status(500).send("Internal Server Error");
    return;
  }
  if (err instanceof HttpException) {
    res.status(err.status).render("Error", { message: err.message });
    return;
  }

  res.status(500).render("Error", { message: "Internal Server Error" });
};

router.route("/").get(async (req, res) => {
  try {
    var files = await FileDatabase.listFiles();

    var scripts = required["Index"];
    var IDs = files.map((file) => file['fileid']);
    var names = files.map((file) => file['name']);

    res.render("Index", { IDs: IDs, names: names, scripts: scripts });
  } catch (err) {
    errorHandler(err, req, res, () => { res.status(500).send(handlerError) });
  }
});

router
  .route("/edit/:fileID")
  .get(async (req, res) => {
    try {
      var { fileID } = req.params;

      if (!fileID) {
        throw new BadRequestException("fileID");
      }

      if (!validate(fileID)) {
        throw new DataNotFoundException("File", fileID);
      }

      var fileData = await FileDatabase.findFile(fileID);

      var fileBuffer = await FileSystem.readFile(fileID);

      var fileContent = fileBuffer.toString('utf-8');

      var scripts = required["Editor"];

      res.render("Editor", { fileName: fileData['name'], fileContent: fileContent, scripts: scripts });
    }
    catch (err) {
      errorHandler(err, req, res, () => { res.status(500).send(handlerError) });
    }
  })
  .post(async (req, res) => {
    try {
      var { fileID } = req.params;
      var { fileName, fileBody } = req.body;

      if (!fileID) {
        throw new BadRequestException("fileID");
      }

      if (!validate(fileID)) {
        throw new DataNotFoundException("File", fileID);
      }

      if (fileName) {
        var fileData = await FileDatabase.findFile(fileID);

        if (fileName != fileData['name'])
          await FileDatabase.renameFile(fileID, fileName);
      }

      if (fileBody) await FileSystem.writeFile(fileID, fileBody);
    }
    catch (err) {
      errorHandler(err, req, res, () => { res.status(500).send(handlerError) });
    }
  })
  .delete(async (req, res) => {
    try {
      var { fileID } = req.params;

      if (!fileID) {
        throw new BadRequestException("fileID");
      }

      if (!validate(fileID)) {
        throw new DataNotFoundException("File", fileID);
      }

      await FileDatabase.archiveFile(fileID);

      res.redirect("/");
    }
    catch (err) {
      errorHandler(err, req, res, () => { res.status(500).send(handlerError) });
    }
  })

router.get("/read/:fileID", async (req, res) => {
  try {
    var { fileID } = req.params;

    if (!fileID) {
      throw new BadRequestException("fileID");
    }

    if (!validate(fileID)) {
      throw new DataNotFoundException("File", fileID);
    }

    var fileData = await FileDatabase.findFile(fileID);

    var fileBuffer = await FileSystem.readFile(fileID);

    var fileContent = fileBuffer.toString('utf-8');

    res.render("Reader", { fileName: fileData['name'], fileContent: fileContent });
  }
  catch (err) {
    errorHandler(err, req, res, () => { res.status(500).send(handlerError) });
  }
});

router.get("/edit", (req, res) => res.redirect("/"));
router.get("/read", (req, res) => res.redirect("/"));

router.get("/trash", async (req, res) => {
  try {
    var files = await FileDatabase.listArchivedFiles();

    if (files.length === 0) {
      res.render("Trash", { IDs: [], names: [] });
      return;
    }

    if (!files[0]['fileid']) {
      throw new InternalServerException("showing file id on the trash page");
    }

    if (!files[0]['name']) {
      throw new InternalServerException("showing file names on the trash page");
    }

    var IDs = files.map((file) => file['fileid']);
    var names = files.map((file) => file['name']);
    res.render("Trash", { IDs: IDs, names: names });
  } catch (err) {
    errorHandler(err, req, res, () => { res.status(500).send(handlerError) });
  }
});

router.post("/new", async (req, res) => {
  try {
    var { fileName } = req.body;

    if (!fileName) {
      fileName = "New File";
    }

    var fileID = v4();

    fileName = parse(fileName).name;

    await FileDatabase.enterFile(fileID, fileName);

    await FileSystem.createFile(fileID);

    res.redirect(`/edit/${fileID}`);
  }
  catch (err) {
    errorHandler(err, req, res, () => { res.status(500).send(handlerError) });
  }
});

router
  .route("/delete/:fileID")
  .post(async (req, res) => {
    try {
      var { fileID } = req.params;

      if (!fileID) {
        throw new BadRequestException("fileID");
      }

      if (!validate(fileID)) {
        throw new DataNotFoundException("File", fileID);
      }

      await FileDatabase.archiveFile(fileID);

      res.redirect("/");
    }
    catch (err) {
      errorHandler(err, req, res, () => { res.status(500).send(handlerError) });
    }
  })
  .delete(async (req, res) => {
    try {
      var { fileID } = req.params;

      if (!fileID) {
        throw new BadRequestException("fileID");
      }

      if (!validate(fileID)) {
        throw new DataNotFoundException("File", fileID);
      }

      await FileDatabase.deleteFile(fileID);
      await FileSystem.deleteFile(fileID);

      res.redirect("/trash");
    }
    catch (err) {
      errorHandler(err, req, res, () => { res.status(500).send(handlerError) });
    }
  });

router.get("/js/:scriptName", async (req, res) => {
  try {
    var { scriptName } = req.params;

    if (!scriptName) {
      throw new BadRequestException("scriptName");
    }
    res.sendFile(join(jsPath, "public", scriptName));
  }
  catch (err) {
    errorHandler(err, req, res, () => { res.status(500).send(handlerError) });
  }
});

router.get("/:fileID", async (req, res, next) => {
  try {
    var { fileID } = req.params;

    if (!fileID || !validate(fileID)) {
      next();
    } else {
      var fileData = await FileDatabase.findFile(fileID);

      var fileBuffer = await FileSystem.readFile(fileID);

      var fileContent = fileBuffer.toString('utf-8');

      res.render("Preview", { fileName: fileData['name'], fileContent: fileContent });
    }
  }
  catch (err) {
    errorHandler(new NotFoundException("File", req.url),
      req, res, () => { res.status(500).send(handlerError) });
  }
});

router.get("*", (req, res) => {
  errorHandler(
    new NotFoundException("Page", req.url), req, res, () => {
      res.status(500).send(handlerError);
    });
});

router.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});