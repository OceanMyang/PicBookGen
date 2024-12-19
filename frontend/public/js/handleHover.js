import { appendItem, clearMenu, hideMenu, showMenu } from "./actionMenu.js";
import { $actionMenu, $textContainer } from "./components.js";
import { deleteLinkByImage } from "./deleteImage.js";
import saveFile from "./saveFile.js";

if (!$textContainer.length) {
  console.error("Text viewer not found");
}

$(document).on("mouseover", async (e) => {
  if (e.target.tagName === "A" && $(e.target).closest($textContainer).length) {
    var anchor = e.target;
    var response = await fetch(anchor.href);

    if (response.ok) {
      clearMenu();
      appendItem(imageViewer(anchor.href));
      var rect = anchor.getBoundingClientRect();
      showMenu(rect);
    } else {
      if (
        confirm("This image is missing. Would you like to delete the link?")
      ) {
        deleteLinkByImage(anchor.href);
        saveFile();
      }
    }
  } else {
    if ($(e.target).closest($actionMenu).length === 0) {
      hideMenu();
    }
  }
});

const imageViewer = (src, alt) =>
  $("<img>", {
    id: "image-viewer",
    src: src,
    alt: alt ? alt : "Loading...",
    display: "block",
    width: "50vw",
  });
