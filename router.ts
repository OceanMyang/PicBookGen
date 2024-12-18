import express, { ErrorRequestHandler, Request, Response } from "express";
import multer, { DiskStorageOptions } from "multer";
import { fileTypeFromFile } from "file-type";
import bodyParser from "body-parser";
import path, { join } from "path";
import { v4, validate } from "uuid";
import FileDatabase from "./database/fileDatabase";
import FileSystem from "./files/fileSystem";
import { BadRequestException, DataNotFoundException, FileNotFoundException, HttpException, InternalServerException, NotFoundException } from "./utils/error.utils";
import { viewPath } from "./frontend/views/view.path";
import { publicPath } from "./frontend/public/public.path";
import { required } from "./frontend/js.required";
import { uploadPath } from "./uploads/upload.path";
import { NextFunction } from "express-serve-static-core";

const router = express();
const port = 3000;
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
router.use("/", express.static(publicPath));

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

const renderHandler = (res: Response, view: string, options: any) => {
  res.render(view, options, (err, html) => {
    if (err) {
      console.log(err);
      throw new InternalServerException("rendering the page");
    }
    res.send(html);
  });
}

router.use(errorHandler);

router.get("/", async (req, res, next) => {
  try {
    var files = await FileDatabase.listFiles();

    var scripts = required["Index"];
    var IDs = files.map((file) => file['fileid']);
    var names = files.map((file) => file['name']);

    renderHandler(res, "Index", {
      IDs: IDs,
      names: names,
      scripts: scripts
    });
  } catch (err) {
    next(err);
  }
}, errorHandler);

router
  .route("/edit/:fileID")
  .get(async (req, res, next) => {
    try {
      var { fileID } = req.params;

      var fileData = await FileDatabase.findFile(fileID);

      var fileBuffer = await FileSystem.readFile(fileID);

      var fileContent = fileBuffer.toString('utf-8');

      var scripts = required["Editor"];

      renderHandler(res, "Editor", {
        fileID: fileID,
        filename: fileData['name'],
        fileContent: fileContent,
        scripts: scripts
      });
    }
    catch (err) {
      next(err)
    };
  })
  .post(async (req, res, next) => {
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
      next(err);
    }
  }, errorHandler)
  .delete(async (req, res, next) => {
    try {
      var { fileID } = req.params;

      await FileDatabase.archiveFile(fileID);

      res.redirect("/");
    }
    catch (err) {
      next(err);
    }
  }, errorHandler)

router.get("/read/:fileID", async (req, res, next) => {
  try {
    var { fileID } = req.params;

    if (!validate(fileID)) {
      throw new DataNotFoundException("File", fileID);
    }

    var fileData = await FileDatabase.findFile(fileID);

    var fileBuffer = await FileSystem.readFile(fileID);

    var fileContent = fileBuffer.toString('utf-8');

    var scripts = required["Reader"];
    renderHandler(res, "Reader",
      { filename: fileData['name'], fileContent: fileContent, scripts: scripts });
  }
  catch (err) {
    next(err);
  }
}, errorHandler);

router.get(["/edit", "/read"], (req, res, next) => res.redirect("/"));

router.route(["/edit/:fileID/images", "/read/:fileID/images"])
  .get(async (req, res, next) => {
    try {
      var { fileID } = req.params;
      var images = await FileSystem.showImages(fileID);
      var scripts = required["Images"];
      renderHandler(res, "Images", { images: images, scripts: scripts });
    } catch (err) {
      next(err);
    }
  });

router.get(["/edit/:fileID/:imageID", "/read/:fileID/:imageID"],
  async (req, res, next) => {
    try {
      var { fileID, imageID } = req.params;
      var path = await FileSystem.accessFile(fileID, imageID);
      res.sendFile(path);
    } catch (err) {
      next(err);
    }
  });


router.get("/trash", async (req, res, next) => {
  try {
    var files = await FileDatabase.listArchivedFiles();

    var IDs = files.map((file) => file['fileid']);
    var names = files.map((file) => file['name']);
    var scripts = required["Trash"];
    renderHandler(res, "Trash", {
      IDs: IDs,
      names: names,
      scripts: scripts
    });
  } catch (err) {
    next(err);
  }
}, errorHandler);

router.post("/new", async (req, res, next) => {
  try {
    var fileID = v4();

    await FileDatabase.enterFile(fileID, "New File");

    await FileSystem.createFile(fileID);

    res.redirect(`/edit/${fileID}`);
  }
  catch (err) {
    next(err);
  }
}, errorHandler);

router.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    console.log(req.file);
    if (!req.file) {
      throw new BadRequestException("File not uploaded.");
    }

    var result = await fileTypeFromFile(req.file.path);
    if (result) {
      await FileSystem.deleteUpload(req.file.filename);
      throw new BadRequestException("File must be a text file.");
    }

    var filename = path.basename(req.file.originalname, path.extname(req.file.originalname));
    var fileID = req.file.filename;
    await FileDatabase.enterFile(fileID, filename);
    await FileSystem.uploadFile(fileID);
    res.redirect(`/edit/${fileID}`);
  }
  catch (err) {
    next(err);
  }
}, errorHandler);

router.post("/upload/:fileID", upload.single("image"), async (req, res, next) => {
  try {
    var { fileID } = req.params;
    console.log(req.file);
    if (!req.file) {
      throw new BadRequestException("Image not uploaded.");
    }

    var result = await fileTypeFromFile(req.file.path);
    if (!result || !result.mime.startsWith("image")) {
      throw new BadRequestException("File must be an image file.");
    }

    var imageID = req.file.filename;
    var ext = path.extname(req.file.originalname);
    await FileSystem.renameImage(fileID, imageID, ext);
    res.send(imageID + ext);
  }
  catch (err) {
    if (req.file) {
      await FileSystem.deleteUpload(req.file.filename);
    }
    next(err);
  }
}, errorHandler);

router
  .route("/delete/:fileID")
  .post(async (req, res, next) => {
    try {
      var { fileID } = req.params;

      await FileDatabase.archiveFile(fileID);

      res.redirect("/");
    }
    catch (err) {
      next(err);
    }
  }, errorHandler)
  .delete(async (req, res, next) => {
    try {
      var { fileID } = req.params;

      var fileData = await FileDatabase.deleteFile(fileID);
      await FileSystem.deleteFile(fileID);

      res.status(200).send(fileData);
    }
    catch (err) {
      next(err);
    }
  }, errorHandler);

router.delete("/delete/:fileID/:imageID", async (req, res, next) => {
  try {
    var { fileID, imageID } = req.params;
    await FileSystem.deleteImage(fileID, imageID);
    res.status(200).send(imageID);
  } catch (err) {
    next(err);
  }
}, errorHandler);

router.post("/restore/:fileID", async (req, res, next) => {
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
    next(err);
  }
}, errorHandler);

router.get(["/css/:file", "/js/:file", "/res/:file"], (req, res, next) => {
  var { file } = req.params;
  res.sendFile(join(publicPath, file));
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

      renderHandler(res, "Preview",
        { filename: fileData['name'], fileContent: fileContent });
    }
  }
  catch (err) {
    next(err);
  }
}, errorHandler);

router.get("*", (req: Request, res: Response, next: NextFunction) =>
  next(new NotFoundException("Page")),
  errorHandler);

router.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});