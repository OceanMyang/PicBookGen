import express, { ErrorRequestHandler } from "express";
import multer, { DiskStorageOptions } from "multer";
import bodyParser from "body-parser";
import { join } from "path";
import { v4, validate } from "uuid";
import FileDatabase from "./database/fileDatabase";
import FileSystem from "./files/fileSystem";
import { BadRequestException, DataNotFoundException, FileNotFoundException, HttpException, InternalServerException, NotFoundException } from "./utils/error.utils";
import { resPath } from "./frontend/res/res.path";
import { viewPath } from "./frontend/views/view.path";
import { cssPath } from "./frontend/css/css.path";
import { jsPath } from "./frontend/js/js.path";
import { required } from "./frontend/js/js.required";
import { filesPath } from "./files/files.path";
import { uploadPath } from "./uploads/upload.path";

const router = express();
const port = process.env.PORT || 3000;
const handlerError = "Error in ErrorHandler";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    var fileID = v4();
    cb(null, fileID);
  }
});
const upload = multer({ storage: storage });

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.set("views", viewPath);
router.set("view engine", "ejs");
router.use("/css", express.static(cssPath));
router.use("/res", express.static(resPath));

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log(err);
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

      var fileData = await FileDatabase.findFile(fileID);

      var fileBuffer = await FileSystem.readFile(fileID);

      var fileContent = fileBuffer.toString('utf-8');

      var scripts = required["Editor"];

      res.render("Editor", { filename: fileData['name'], fileContent: fileContent, scripts: scripts });
    }
    catch (err) {
      errorHandler(err, req, res, () => { res.status(500).send(handlerError) });
    }
  })
  .post(async (req, res) => {
    try {
      var { fileID } = req.params;
      var { filename, fileBody } = req.body;

      if (filename) {
        var fileData = await FileDatabase.findFile(fileID);

        if (filename != fileData['name'])
          await FileDatabase.renameFile(fileID, filename);
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

    if (!validate(fileID)) {
      throw new DataNotFoundException("File", fileID);
    }

    var fileData = await FileDatabase.findFile(fileID);

    var fileBuffer = await FileSystem.readFile(fileID);

    var fileContent = fileBuffer.toString('utf-8');

    res.render("Reader", { filename: fileData['name'], fileContent: fileContent });
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

    var IDs = files.map((file) => file['fileid']);
    var names = files.map((file) => file['name']);
    var scripts = required["Trash"];
    res.render("Trash", { IDs: IDs, names: names, scripts: scripts });
  } catch (err) {
    errorHandler(err, req, res, () => { res.status(500).send(handlerError) });
  }
});

router.post("/new", async (req, res) => {
  try {
    var fileID = v4();

    await FileDatabase.enterFile(fileID, "New File");

    await FileSystem.createFile(fileID);

    res.redirect(`/edit/${fileID}`);
  }
  catch (err) {
    errorHandler(err, req, res, () => { res.status(500).send(handlerError) });
  }
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log(req.file);
    if (!req.file) {
      throw new BadRequestException("File not uploaded");
    }
    if (req.file.mimetype !== "text/plain") {
      await FileSystem.deleteUpload(req.file.filename);
      throw new BadRequestException("File must be a text file");
    }

    var filename = req.file.originalname;
    var fileID = req.file.filename;
    await FileDatabase.enterFile(fileID, filename);
    await FileSystem.uploadFile(fileID);
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

      var fileData = await FileDatabase.deleteFile(fileID);
      await FileSystem.deleteFile(fileID);

      res.status(200).send(fileData);
    }
    catch (err) {
      errorHandler(err, req, res, () => { res.status(500).send(handlerError) });
    }
  });

router.post("/restore/:fileID", async (req, res) => {
  try {
    console.log("Restoring file");

    var { fileID } = req.params;

    if (!validate(fileID)) {
      throw new DataNotFoundException("File", fileID);
    }

    await FileDatabase.restoreFile(fileID);

    res.redirect("/trash");
  }
  catch (err) {
    errorHandler(err, req, res, () => { res.status(500).send(handlerError) });
  }
});

router.get("/js/:scriptName", async (req, res) => {
  try {
    var { scriptName } = req.params;

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

      res.render("Preview", { filename: fileData['name'], fileContent: fileContent });
    }
  }
  catch (err) {
    errorHandler(new NotFoundException("File", req.url),
      req, res, () => { res.status(500).send(handlerError) });
  }
});

router.get("*", (req, res) => {
  errorHandler(new NotFoundException("Page", req.url),
    req, res, () => res.status(500).send(handlerError));
});

router.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});