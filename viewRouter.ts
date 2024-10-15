import express, { json } from "express";
import { publicPath } from "./frontend/public/publicPath";
import FileDatabase from "./database/fileDatabase";
import FileSystem from "./files/fileSystem";

const app = express();
const port = process.env.PORT || 3000;

app.set("views", "./views");
app.set("view engine", "ejs");
app.use(json());

app.use("/", express.static("."));
app.use("/", express.static(publicPath));
app.route("/").get(async (req, res) => {
  var files = await FileDatabase.listFilesAndNames();
  if (files.length === 0) {
    res.render("EmptyIndex");
  } else {
    res.render("Index", { files: files });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

