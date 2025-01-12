import express, { ErrorRequestHandler, Request, Response } from "express";
import multer from "multer";
import bodyParser from "body-parser";
import path, { join } from "path";
import { v4, validate } from "uuid";
import bycrpt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import FileDatabase from "./src/db/fileDatabase.js";
import FileSystem from "./src/sys/fileSystem.js";
import {
  BadRequestException,
  DataNotFoundException,
  HttpException,
  NotFoundException,
  GatewayTimeoutException,
  BadGatewayException,
  AccessDeniedException,
  ConflictException,
  InternalServerException
} from "./src/utils/error.util.js";
import { viewPath } from "./frontend/views/view.path.js";
import { publicPath } from "./frontend/public/public.path.js";
import { required } from "./frontend/js.required.js";
import { uploadPath } from "./uploads/upload.path.js";
import { NextFunction } from "express-serve-static-core";
import { Readable } from "stream";
import mime from "mime-types";
import UserDatabase from "src/db/userDatabase.js";
import { convertCompilerOptionsFromJson } from "typescript";

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
const limits = {
  fileSize: 1024 * 1024 * 10,
  files: 1
};

const upload = multer({ storage: storage, limits: limits });
if (!process.env.JWT_SECRET) {
  throw new Error("JWT secret is not set in .env file.");
}
const secret_key = process.env.JWT_SECRET;

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(cookieParser());
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

const renderHandler = (res: Response, view: string, options: any, status: number = 200) => {
  res.render(view, options, (err, html) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error occurred while rendering the page.");
    }
    res.status(status).send(html);
  });
}

const errorRenderer: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.log("Handler: " + err);

  if (res.headersSent) {
    console.log("Headers sent");
    return;
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return renderHandler(res, "Error", { message: "The uploaded file exceeds the size limit of 1MB." }, 413);
  }

  if (err instanceof HttpException) {
    return renderHandler(res, "Error", { message: err.message }, err.status);
  }

  return res.status(500).render("Error", { message: "Internal Server Error" });
};

const errorSender: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.log("Handler: " + err);
  if (res.headersSent) {
    console.log("Headers sent");
    return;
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(413).send("The uploaded file exceeds the size limit of 1MB.");
    return;
  }

  if (err instanceof HttpException) {
    res.status(err.status).send(err.message);
    return;
  }

  res.status(500).send("Internal Server Error");
};

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const cookies = req.cookies;

  if (!cookies) {
    throw new HttpException(401, "You must enable cookies to use this service.");
  }

  const token = cookies.authToken;

  if (!token) {
    console.log("Login attempt from unauthorized user");
    return res.status(401).redirect('/login');
  };

  jwt.verify(token, secret_key, (err: any, payload: any) => {
    if (err) {
      console.log("Invalid token or expired token detected");
      return res.status(403).redirect('/login');
    };

    req.body.payload = payload;

    next();
  });
}

function validateUser(userID: string) {
  if (!userID) {
    throw new AccessDeniedException("Token is invalid or has expired.");
  }
}

function validateInputs(email: string, password: string) {
  if (!email || !password) {
    throw new BadRequestException("Email and password are required.");
  }

  if (email.length < 5 || email.length > 50) {
    throw new BadRequestException("Email address is invalid.");
  }

  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    throw new BadRequestException("Email address is invalid.");
  }

  if (password.length < 8 || password.length > 50) {
    throw new BadRequestException("Password length must be between 8 - 50 characters.");
  }

  if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,50}$/.test(password)) {
    throw new BadRequestException("Password must contain one letter and one number.");
  }
}

router.route("/register")
  .get((req: Request, res: Response) => {
    renderHandler(res, "Register", {});
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      validateInputs(email, password);

      const email_f = email.toLowerCase();

      const user = await UserDatabase.getUserByEmail(email_f);

      if (user) {
        throw new ConflictException("User", email_f);
      }

      const passwordHash = await bycrpt.hash(password, 10);

      const userID = v4();

      await UserDatabase.registerUser(userID, email_f, passwordHash);

      const fileID = v4();

      await FileDatabase.enterFile(fileID, "Demo", userID);

      await FileSystem.createDemoFile(fileID);

      const token = jwt.sign({ userID: userID }, secret_key, { expiresIn: '1h' });

      res.cookie('authToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
      });

      res.status(200).redirect('/');
    } catch (error) {
      console.error(error);
      next(error);
    }
  }, errorRenderer);

router.route('/login')
  .get((req: Request, res: Response) => {
    renderHandler(res, "Login", {});
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      validateInputs(email, password);

      const user = await UserDatabase.getUserByEmail(email.toLowerCase());

      if (!user) {
        throw new AccessDeniedException("Email has not registered.");
      }

      const isPasswordValid = await bycrpt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        throw new AccessDeniedException("Email or password is incorrect.");
      }

      const token = jwt.sign({ userID: user.userid }, secret_key, { expiresIn: '1h' });

      res.cookie('authToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
      });

      res.status(200).redirect('/');
    } catch (error) {
      console.error(error);
      next(error);
    }
  }, errorRenderer);

router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("authToken");
  res.redirect("/login");
});

router.get("/", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userID = req.body.payload.userID;

    validateUser(userID);

    const user = await UserDatabase.getUserByID(userID);

    if (!user) {
      throw new AccessDeniedException("Token is invalid or has expired.");
    };

    const files = await FileDatabase.listFiles(userID);

    const scripts = required["Index"];

    renderHandler(res, "Index", {
      user: user,
      files: files,
      scripts: scripts
    });
  } catch (err) {
    next(err);
  }
}, errorRenderer);

router
  .route("/edit/:fileID")
  .get(authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userID = req.body.payload.userID;

      validateUser(userID);

      const { fileID } = req.params;

      const fileData = await FileDatabase.findFile(fileID, userID);

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
  }, errorRenderer)
  .post(authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userID = req.body.payload.userID;

      validateUser(userID);

      const { fileID } = req.params;
      const { filename, filebody } = req.body;

      if (filename) {
        const fileData = await FileDatabase.findFile(fileID, userID);

        if (filename != fileData['name'])
          await FileDatabase.renameFile(fileID, filename, userID);
      }

      if (filebody) await FileSystem.writeFile(fileID, filebody);
    }
    catch (err) {
      next(err);
    }
  }, errorSender)
  .delete(authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userID = req.body.payload.userID;

      validateUser(userID);

      const { fileID } = req.params;

      await FileDatabase.archiveFile(fileID, userID);

      res.redirect("/");
    }
    catch (err) {
      next(err);
    }
  }, errorSender)

router.get("/read/:fileID", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userID = req.body.payload.userID;

    validateUser(userID);

    const { fileID } = req.params;

    if (!validate(fileID)) {
      throw new DataNotFoundException("File", fileID);
    }

    const fileData = await FileDatabase.findFile(fileID, userID);

    const fileBuffer = await FileSystem.readFile(fileID);

    const fileContent = fileBuffer.toString('utf-8');

    const scripts = required["Reader"];

    renderHandler(res, "Reader",
      { filename: fileData['name'], fileContent: fileContent, scripts: scripts });
  }
  catch (err) {
    next(err);
  }
}, errorRenderer);

router.get(["/edit", "/read"], (req: Request, res: Response, next: NextFunction) => res.redirect("/"));

router.route("/access/:fileID")
  .get(authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userID = req.body.payload.userID;

      validateUser(userID);

      const { fileID } = req.params;
      const images = await FileSystem.listImages(fileID);
      const scripts = required["Images"];
      renderHandler(res, "Images", { fileID: fileID, images: images, scripts: scripts });
    } catch (err) {
      next(err);
    }
  }, errorSender);

router.get("/access/:fileID/:imageID", authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userID = req.body.payload.userID;

      validateUser(userID);

      const { fileID, imageID } = req.params;
      const path = await FileSystem.accessFile(fileID, imageID);
      res.sendFile(path);
    } catch (err) {
      next(err);
    }
  }, errorSender);

router.get("/trash", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userID = req.body.payload.userID;

    validateUser(userID);

    const files = await FileDatabase.listArchivedFiles(userID);

    const scripts = required["Trash"];
    renderHandler(res, "Trash", {
      files: files,
      scripts: scripts
    });
  } catch (err) {
    next(err);
  }
}, errorRenderer);

router.post("/new", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fileID = v4();

    const userID = req.body.payload.userID;

    validateUser(userID);

    await FileDatabase.enterFile(fileID, "New File", userID);

    await FileSystem.createFile(fileID);

    res.redirect(`/edit/${fileID}`);
  }
  catch (err) {
    next(err);
  }
}, errorRenderer);

router.post("/upload", upload.single("file"), authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userID = req.body.payload.userID;

    validateUser(userID);

    console.log(req.file);
    if (!req.file) {
      throw new BadRequestException("File not uploaded.");
    }

    if (!req.file.mimetype.startsWith("text")) {
      throw new BadRequestException("File must be an image file.");
    }

    const filename = path.basename(req.file.originalname, path.extname(req.file.originalname));
    const fileID = req.file.filename;
    await FileDatabase.enterFile(fileID, filename, userID);
    await FileSystem.uploadFile(fileID);
    res.redirect(`/edit/${fileID}`);
  }
  catch (err) {
    if (req.file) {
      await FileSystem.deleteUpload(req.file.filename);
    }
    next(err);
  }
}, errorSender);

router.post("/upload/:fileID", upload.single("image"), authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userID = req.body.payload.userID;

    validateUser(userID);

    const { fileID } = req.params;
    console.log(req.file);
    if (!req.file) {
      throw new BadRequestException("Image not uploaded.");
    }

    if (!req.file.mimetype.startsWith("image")) {
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
}, errorSender);

router.delete("/delete", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userID = req.body.payload.userID;

    validateUser(userID);

    const files = await FileDatabase.listFiles(userID);
    for (const file of files) {
      await FileSystem.deleteFile(file.fileid);
    }

    await UserDatabase.deleteUser(userID);

    console.log(`User ${userID} and all files deleted from server permanently.`);

    res.status(200).redirect('/register');
  } catch (err) {
    next(err);
  }
}, errorSender);

router
  .route("/delete/:fileID")
  .post(authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userID = req.body.payload.userID;

      validateUser(userID);

      const { fileID } = req.params;

      await FileDatabase.archiveFile(fileID, userID);

      res.redirect("/");
    }
    catch (err) {
      next(err);
    }
  }, errorSender)
  .delete(authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userID = req.body.payload.userID;

      validateUser(userID);

      const { fileID } = req.params;

      const fileData = await FileDatabase.deleteFile(fileID, userID);
      await FileSystem.deleteFile(fileID);

      res.status(200).send(fileData);
    }
    catch (err) {
      next(err);
    }
  }, errorSender);

router.delete("/delete/:fileID/all", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userID = req.body.payload.userID;

    validateUser(userID);

    const { fileID, imageID } = req.params;
    await FileSystem.deleteAllImages(fileID);
    res.status(200).send(imageID);
  } catch (err) {
    next(err);
  }
}, errorSender);

router.delete("/delete/:fileID/:imageID", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userID = req.body.payload.userID;

    validateUser(userID);

    const { fileID, imageID } = req.params;
    await FileSystem.deleteImage(fileID, imageID);
    res.status(200).send(imageID);
  } catch (err) {
    next(err);
  }
}, errorSender);

router.post("/restore/:fileID", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userID = req.body.payload.userID;

    validateUser(userID);

    console.log("Restoring file");

    const { fileID } = req.params;

    if (!validate(fileID)) {
      throw new DataNotFoundException("File", fileID);
    }

    await FileDatabase.restoreFile(fileID, userID);

    res.redirect("/trash");
  }
  catch (err) {
    next(err);
  }
}, errorSender);

router.post("/generate/:fileID", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  const timeout = setTimeout(() => {
    next(new GatewayTimeoutException("Image"));
  }, 30000);

  try {
    const userID = req.body.payload.userID;

    validateUser(userID);

    const { prompt } = req.body;
    const { fileID } = req.params;
    if (!prompt) {
      throw new BadRequestException("Prompt not provided.");
    }

    const response = await fetch(api + textToUrlSlug(prompt));
    if (!response.ok || !response.body) {
      throw new BadGatewayException(`Failed to fetch image: ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith("image")) {
      throw new BadGatewayException(`Invalid content type: ${contentType}`);
    }
    const imageID = v4();
    const extension = "." + mime.extension(contentType);
    if (!extension) {
      throw new BadGatewayException(`Invalid content type: ${contentType}`);
    }
    const readStream = Readable.from(response.body);
    const writeStream = FileSystem.createWriteStream(fileID, imageID, extension);
    readStream.pipe(writeStream);

    writeStream.on('error', (error) => {
      next(error);
    });

    writeStream.on('finish', () => {
      clearTimeout(timeout);
      if (res.headersSent) {
        throw new InternalServerException("generating the image (headers sent)");
      }
      res.status(200).send(imageID + extension);
    });
  }
  catch (err) {
    clearTimeout(timeout);
    next(err);
  }
}, errorSender);

router.get(["/css/:file", "/js/:file", "/res/:file"], (req: Request, res: Response, next: NextFunction) => {
  const { file } = req.params;
  res.sendFile(join(publicPath, file));
});

router.get("/:fileID", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userID = req.body.payload.userID;

    validateUser(userID);

    const { fileID } = req.params;

    if (!fileID || !validate(fileID)) {
      next(new NotFoundException("Page"));
    }
    else {
      const fileData = await FileDatabase.findFile(fileID, userID);

      const fileBuffer = await FileSystem.readFile(fileID);

      const fileContent = fileBuffer.toString('utf-8');

      renderHandler(res, "Preview",
        { filename: fileData['name'], fileContent: fileContent });
    }
  }
  catch (err) {
    next(err);
  }
}, errorSender);

router.get("*", (req: Request, res: Response, next: NextFunction) =>
  next(new NotFoundException("Page")),
  errorRenderer
);

router.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});