import express, { json, Response, Request, ErrorRequestHandler, NextFunction } from "express";
import { join, parse } from "path";
import { v4, validate } from "uuid";
import FileDatabase from "./database/fileDatabase";
import FileManager from "./files/fileManager";
import { BadRequestException, DataNotFoundException, HttpException, NotFoundException } from "./utils/error.utils";
import { resPath } from "./frontend/res/res.path";
import { viewPath } from "./frontend/views/view.path";
import { filesPath } from "./files/files.path";
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

router.route("/").get(async (req, res) => {
  var files = await FileDatabase.listFiles();

  var scripts = required["Index"];

  if (files.length === 0) {
    res.render("EmptyIndex");
  } else {
    res.render("Index", { files: files, scripts: scripts });
  }
});

router
  .route("/edit/:fileID")
  .get(async (req, res) => {
    try {
      const { fileID } = req.params;

      if (!fileID) {
        throw new BadRequestException("fileID");
      }

      if (!validate(fileID)) {
        throw new DataNotFoundException("File", fileID);
      }

      router.use(`/edit/${fileID}`, express.static(join(filesPath, fileID)));

      var fileData = await FileDatabase.findFile(fileID);

      var fileBuffer = await FileManager.readFile(fileID);

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
      const { fileID } = req.params;
      const { fileName, fileBody } = req.body;

      if (!fileID) {
        throw new BadRequestException("fileID");
      }

      if (!validate(fileID)) {
        throw new DataNotFoundException("File", fileID);
      }

      if (fileBody === undefined) {
        throw new BadRequestException("fileBody");
      }

      if (fileName === undefined) {
        throw new BadRequestException("fileName");
      }

      var fileData = await FileDatabase.findFile(fileID);

      if (fileName != fileData['name']) {
        await FileDatabase.renameFile(fileID, fileName);
      }

      await FileManager.writeFile(fileID, fileBody);

      res.redirect(`/edit/${fileID}`);
    }
    catch (err) {
      errorHandler(err, req, res, () => { res.status(500).send(handlerError) });
    }
  })
  .delete(async (req, res) => {
    try {
      const { fileID } = req.params;

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

router.get("/edit", (req, res) => {
  res.redirect("/");
});

router.post("/new", async (req, res) => {
  try {
    var { fileName, fileBody } = req.body;

    if (!fileName) {
      fileName = "Untitled";
    }

    var fileID = v4();

    fileName = parse(fileName).name;

    await FileDatabase.enterFile(fileID, fileName);

    await FileManager.createFile(fileID);

    if (fileBody) {
      await FileManager.writeFile(fileID, fileBody);
    }

    res.redirect(`/edit/${fileID}`);
  }
  catch (err) {
    errorHandler(err, req, res, () => { res.status(500).send(handlerError) });
  }
});

router.get("/read/:fileID", async (req, res) => {
  try {
    const { fileID } = req.params;

    if (!fileID) {
      throw new BadRequestException("fileID");
    }

    if (!validate(fileID)) {
      throw new DataNotFoundException("File", fileID);
    }

    var fileData = await FileDatabase.findFile(fileID);

    var fileBuffer = await FileManager.readFile(fileID);

    var fileContent = fileBuffer.toString('utf-8');

    router.use(`/read/${fileID}`, express.static(join(filesPath, fileID)));

    res.render("Reader", { fileName: fileData['name'], fileContent: fileContent });
  }
  catch (err) {
    errorHandler(err, req, res, () => { res.status(500).send(handlerError) });
  }
});

router.get("/preview/:fileID", async (req, res) => {
  try {
    const { fileID } = req.params;

    if (!fileID) {
      throw new BadRequestException("fileID");
    }

    if (!validate(fileID)) {
      throw new DataNotFoundException("File", fileID);
    }

    var fileData = await FileDatabase.findFile(fileID);

    var fileBuffer = await FileManager.readFile(fileID);

    var fileContent = fileBuffer.toString('utf-8');

    res.render("Preview", { fileName: fileData['name'], fileContent: fileContent });
  }
  catch (err) {
    errorHandler(err, req, res, () => { res.status(500).send(handlerError) });
  }
});


router.get("/js/:scriptName", async (req, res) => {
  try {
    const { scriptName } = req.params;

    if (!scriptName) {
      throw new BadRequestException("scriptName");
    }
    res.sendFile(join(jsPath, "public", scriptName));
  }
  catch (err) {
    errorHandler(err, req, res, () => { res.status(500).send(handlerError) });
  }
});

router.get("*", (req, res) => {
  errorHandler(
    new NotFoundException("Page", req.url),
    req,
    res,
    () => {
      res.status(500).send(handlerError);
    });
});

router.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof HttpException) {
    // console.log(error);
    res.status(error.status).render("Error", { message: error.message });
  } else {
    // console.log(error);
    res.status(500).render("Error", { message: "Internal Server Error" });
  }
};