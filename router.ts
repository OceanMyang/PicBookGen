import express, { json, Response, Request, ErrorRequestHandler, NextFunction } from "express";
import { join } from "path";
import { validate } from "uuid";
import FileDatabase from "./database/fileDatabase";
import FileSystem from "./files/fileStorage";
import { BadRequestException, DataNotFoundException, HttpException, NotFoundException } from "./utils/error.utils";
import { resPath } from "./frontend/res/res.path";
import { viewPath } from "./frontend/views/view.path";
import { filesPath } from "./files/files.path";
import { cssPath } from "./frontend/css/css.path";
import { jsPath } from "./frontend/js/js.path";

const router = express();
const port = process.env.PORT || 3000;
const handlerError = "Error in ErrorHandler";

router.set("views", viewPath);
router.set("view engine", "ejs");
router.use(json());
router.use("/js", express.static(jsPath));
router.use("/css", express.static(cssPath));
router.use("/res", express.static(resPath));

router.route("/").get(async (req, res) => {
  var files = await FileDatabase.listFilesAndNames();
  if (files.length === 0) {
    res.render("EmptyIndex");
  } else {
    res.render("Index", { files: files });
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

      var fileData = await FileDatabase.findFile(fileID);

      var fileBuffer = await FileSystem.readFile(fileID);

      var fileContent = fileBuffer.toString('utf-8');

      router.use(`/edit/${fileID}`, express.static(join(filesPath, fileID)));

      res.render("Editor", { fileName: fileData['name'], fileContent: fileContent });
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

      if (!fileBody) {
        throw new BadRequestException("fileBody");
      }

      if (!fileName) {
        throw new BadRequestException("fileName");
      }

      var fileData = await FileDatabase.findFile(fileID);

      if (fileName !== fileData['name']) {
        await FileDatabase.renameFile(fileID, fileName);
      }

      await FileSystem.writeFile(fileID, fileBody);

      var fileBuffer = await FileSystem.readFile(fileID);

      var fileContent = fileBuffer.toString('utf-8');

      res.render("Editor", { fileName: fileName, fileContent: fileContent });
    }
    catch (err) {
      errorHandler(err, req, res, () => { res.status(500).send(handlerError) });
    }
  });

router.get("/edit", (req, res) => {
  res.redirect("/");
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

    var fileBuffer = await FileSystem.readFile(fileID);

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

    await FileDatabase.findFile(fileID);

    var fileBuffer = await FileSystem.readFile(fileID);

    var fileContent = fileBuffer.toString('utf-8');

    res.render("Preview", { fileContent: fileContent });
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
    console.log(error);
    res.status(error.status).render("Error", { message: error.message });
  } else {
    console.log(error);
    res.status(500).render("Error", { message: "Internal Server Error" });
  }
};