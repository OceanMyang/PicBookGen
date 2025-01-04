import express, { ErrorRequestHandler, Request, Response } from "express";
import multer, { DiskStorageOptions } from "multer";
import { fileTypeFromFile } from "file-type";
import bodyParser, { text } from "body-parser";
import path, { join } from "path";
import { v4, validate } from "uuid";
import FileDatabase from "./src/db/fileDatabase.js";
import FileSystem from "./src/sys/fileSystem.js";
import {
  BadRequestException,
  DataNotFoundException,
  HttpException,
  NotFoundException
} from "./src/utils/error.util.js";
import { viewPath } from "./frontend/views/view.path.js";
import { publicPath } from "./frontend/public/public.path.js";
import { required } from "./frontend/js.required.js";
import { uploadPath } from "./uploads/upload.path.js";
import { NextFunction } from "express-serve-static-core";
import { Readable } from "stream";
import mime from "mime-types";

const router = express();
const port = 3000;
const api = "https://pollinations.ai/prompt/";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileID = v4();
    cb(null, fileID);
  }
});
const upload = multer({ storage: storage });

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.set("views", viewPath);
router.set("view engine", "ejs");
router.use("/", express.static(publicPath));

function textToUrlSlug(text: string): string {
  return text
      .toLowerCase()                 // Convert to lowercase
      .trim()                        // Remove leading/trailing whitespace
      .replace(/[^a-z0-9\s-]/g, '')  // Remove non-alphanumeric characters
      .replace(/\s+/g, '-')          // Replace spaces with hyphens
      .replace(/-+/g, '-')           // Remove multiple consecutive hyphens
      .replace(/^-|-$/g, '');        // Trim leading/trailing hyphens
}

const renderHandler = (res: Response, view: string, options: any) => {
  res.render(view, options, (err, html) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
    res.send(html);
  });
}

const errorHandler: ErrorRequestHandler = (err, req: Request, res: Response, next: NextFunction) => {
  console.log("Handler" + err);
  if (res.headersSent) {
    res.status(500).send("Internal Server Error");
    return;
  }

  if (err instanceof HttpException) {
    res.render("Error", { message: err.message }, (error, html) => {
      if (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
      }
      res.status(err.status).send(html);
    });
    return;
  }

  res.status(500).render("Error", { message: "Internal Server Error" });
};

router.use(errorHandler);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = await FileDatabase.listFiles();

    const scripts = required["Index"];

    renderHandler(res, "Index", {
      files: files,
      scripts: scripts
    });
  } catch (err) {
    next(err);
  }
}, errorHandler);

router
  .route("/edit/:fileID")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fileID } = req.params;

      const fileData = await FileDatabase.findFile(fileID);

      const fileBuffer = await FileSystem.readFile(fileID);

      const fileContent = fileBuffer.toString('utf-8');

      const scripts = required["Editor"];

      renderHandler(res, "Editor", {
        file: fileData,
        fileContent: fileContent,
        scripts: scripts
      });
    }
    catch (err) {
      next(err);
    }
  }, errorHandler)
  .post(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fileID } = req.params;
      const { filename, filebody } = req.body;

      if (filename) {
        const fileData = await FileDatabase.findFile(fileID);

        if (filename != fileData['name'])
          await FileDatabase.renameFile(fileID, filename);
      }

      if (filebody) await FileSystem.writeFile(fileID, filebody);
    }
    catch (err) {
      next(err);
    }
  }, errorHandler)
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fileID } = req.params;

      await FileDatabase.archiveFile(fileID);

      res.redirect("/");
    }
    catch (err) {
      next(err);
    }
  }, errorHandler)

router.get("/read/:fileID", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileID } = req.params;

    if (!validate(fileID)) {
      throw new DataNotFoundException("File", fileID);
    }

    const fileData = await FileDatabase.findFile(fileID);

    const fileBuffer = await FileSystem.readFile(fileID);

    const fileContent = fileBuffer.toString('utf-8');

    const scripts = required["Reader"];
    renderHandler(res, "Reader",
      { filename: fileData['name'], fileContent: fileContent, scripts: scripts });
  }
  catch (err) {
    next(err);
  }
}, errorHandler);

router.get(["/edit", "/read"], (req: Request, res: Response, next: NextFunction) => res.redirect("/"));

router.route("/access/:fileID")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fileID } = req.params;
      const images = await FileSystem.listImages(fileID);
      const scripts = required["Images"];
      renderHandler(res, "Images", { fileID: fileID, images: images, scripts: scripts });
    } catch (err) {
      next(err);
    }
  }, errorHandler);

router.get("/access/:fileID/:imageID",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fileID, imageID } = req.params;
      const path = await FileSystem.accessFile(fileID, imageID);
      res.sendFile(path);
    } catch (err) {
      next(err);
    }
  }, errorHandler);

router.get("/trash", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = await FileDatabase.listArchivedFiles();

    const scripts = required["Trash"];
    renderHandler(res, "Trash", {
      files: files,
      scripts: scripts
    });
  } catch (err) {
    next(err);
  }
}, errorHandler);

router.post("/new", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fileID = v4();

    await FileDatabase.enterFile(fileID, "New File");

    await FileSystem.createFile(fileID);

    res.redirect(`/edit/${fileID}`);
  }
  catch (err) {
    next(err);
  }
}, errorHandler);

router.post("/upload", upload.single("file"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.file);
    if (!req.file) {
      throw new BadRequestException("File not uploaded.");
    }

    const result = await fileTypeFromFile(req.file.path);
    if (result) {
      await FileSystem.deleteUpload(req.file.filename);
      throw new BadRequestException("File must be a text file.");
    }

    const filename = path.basename(req.file.originalname, path.extname(req.file.originalname));
    const fileID = req.file.filename;
    await FileDatabase.enterFile(fileID, filename);
    await FileSystem.uploadFile(fileID);
    res.redirect(`/edit/${fileID}`);
  }
  catch (err) {
    next(err);
  }
}, errorHandler);

router.post("/upload/:fileID", upload.single("image"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileID } = req.params;
    console.log(req.file);
    if (!req.file) {
      throw new BadRequestException("Image not uploaded.");
    }

    const result = await fileTypeFromFile(req.file.path);
    if (!result || !result.mime.startsWith("image")) {
      throw new BadRequestException("File must be an image file.");
    }

    const imageID = req.file.filename;
    const extension = path.extname(req.file.originalname);
    await FileSystem.moveImage(fileID, imageID, extension);
    res.send(imageID + extension);
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
  .post(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fileID } = req.params;

      await FileDatabase.archiveFile(fileID);

      res.redirect("/");
    }
    catch (err) {
      next(err);
    }
  }, errorHandler)
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fileID } = req.params;

      const fileData = await FileDatabase.deleteFile(fileID);
      await FileSystem.deleteFile(fileID);

      res.status(200).send(fileData);
    }
    catch (err) {
      next(err);
    }
  }, errorHandler);

router.delete("/delete/:fileID/all", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileID, imageID } = req.params;
    await FileSystem.deleteAllImages(fileID);
    res.status(200).send(imageID);
  } catch (err) {
    next(err);
  }
}, errorHandler);

router.delete("/delete/:fileID/:imageID", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileID, imageID } = req.params;
    await FileSystem.deleteImage(fileID, imageID);
    res.status(200).send(imageID);
  } catch (err) {
    next(err);
  }
}, errorHandler);

router.post("/restore/:fileID", async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Restoring file");

    const { fileID } = req.params;

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

router.post("/generate/:fileID", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt } = req.body;
    const { fileID } = req.params;
    if (!prompt) {
      throw new BadRequestException("Prompt not provided.");
    }
    const response = await fetch(api + textToUrlSlug(prompt));
    if (!response.ok || !response.body) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith("image")) {
      throw new Error(`Invalid content type: ${contentType}`);
    }
    const imageID = v4();
    const extension = "." + mime.extension(contentType);
    if (!extension) {
      throw new Error(`Invalid content type: ${contentType}`);
    }
    const readStream = Readable.from(response.body);
    const writeStream = FileSystem.createWriteStream(fileID, imageID, extension);
    readStream.pipe(writeStream);
    writeStream.on('finish', () => {
      res.status(200).send(imageID + extension);
    });

    writeStream.on('error', (error) => {
      next(error);
    });
  }
  catch (err) {
    next(err);
  }
});

router.get(["/css/:file", "/js/:file", "/res/:file"], (req: Request, res: Response, next: NextFunction) => {
  const { file } = req.params;
  res.sendFile(join(publicPath, file));
});

router.get("/:fileID", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileID } = req.params;

    if (!fileID || !validate(fileID)) {
      next();
    }
    else {
      const fileData = await FileDatabase.findFile(fileID);

      const fileBuffer = await FileSystem.readFile(fileID);

      const fileContent = fileBuffer.toString('utf-8');

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