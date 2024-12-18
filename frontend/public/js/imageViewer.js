import { $imageViewer } from "./components.js";
import deleteLinkByImage from "./deleteImage.js";
import saveFile from "./saveFile.js";

export async function loadImage(src) {
  $imageViewer.attr("alt", "Loading...");
  var result = await fetch(src);
  if (result.ok) {
    $imageViewer.attr("src", src);
    console.log(src);
  } else {
    $imageViewer.attr("alt", "File Missing");
    $imageViewer.attr("src", "");
    if (confirm("This image is missing. Would you like to delete the link?")) {
      deleteLinkByImage(src);
      saveFile();
    }
  }
}

export async function clearImage() {
  $imageViewer.attr("alt", "");
  $imageViewer.attr("src", "");
}