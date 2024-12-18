import { $textViewer } from "./components.js";
import { clearImage, loadImage } from "./imageViewer.js";
$textViewer.on("mouseover", async (e) => {
  if (e.target.tagName === "A") {
    loadImage(e.target.href);
  } else {
    clearImage();
  }
});