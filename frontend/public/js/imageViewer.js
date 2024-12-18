import deleteLinkByImage from "./deleteImage.js";
import saveFile from "./saveFile.js";

$("#text-viewer").on("mouseover", async (e) => {
  if (e.target.tagName === "A") {
    var href = e.target.href;
    $("#image-viewer").attr("alt", "Loading...");
    var result = await fetch(href);
    if (result.ok) {
      $("#image-viewer").attr("src", href);
      console.log(href);
    } else {
      $("#image-viewer").attr("alt", "File Missing");
      $("#image-viewer").attr("src", "");
      if (confirm("This image is missing. Would you like to delete the link?")) {
        deleteLinkByImage(href);
        saveFile();
      }
    }
  } else {
    $("#image-viewer").attr("alt", "");
    $("#image-viewer").attr("src", "");
  }
});

