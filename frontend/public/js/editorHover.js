import {
  appendItem,
  clearMenu,
  getMode,
  hideMenu,
  MODE,
  setMode,
  showMenuAtPos,
} from "./contextMenu.js";
import { editor } from "./components.js";
import { deleteLink } from "./components.js";
import { saveFile } from "./fileSave.js";

if (!$(editor).length) {
  console.error("Editor not found");
}

const imageViewer = (src, alt) =>
  $("<img>", {
    id: "image-viewer",
    src: src,
    alt: alt ? alt : "Loading...",
    display: "block",
    width: "50vw",
  });

$(editor).on("mouseover", "a.view", async (e) => {
  if (getMode() === MODE.VIEW) {
    const anchor = e.target;
    const response = await fetch(anchor.href);
    if (response.ok) {
      clearMenu();
      appendItem(imageViewer(anchor.href));
      setMode(MODE.VIEW);
      const rect = anchor.getBoundingClientRect();
      showMenuAtPos(rect);
    } else {
      if (confirm("This link is broken. Would you like to delete the link?")) {
        deleteLink(anchor);
        saveFile();
      }
    }
  } else {
    if (getMode() === MODE.VIEW) hideMenu();
  }
});
