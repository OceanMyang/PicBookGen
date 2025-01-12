import {
  appendItem,
  clearMenu,
  hideMenu,
  showMenuAtPos,
} from "./contextMenu.js";
import { contextMenu, editor, fileSelector } from "./components.js";

if (!$(editor).length) {
  console.error("Editor not found");
}

if (!$(fileSelector).length) {
  console.error("File selector not found");
}

const imageViewer = (src, alt) =>
  $("<img>", {
    class: "image-viewer",
    src: src,
    alt: alt ? alt : "Loading...",
    display: "block",
  }).css({
    "max-width": "50vw",
    "max-height": "50vh"
  });

$(editor).on("mouseenter", "a.view", async (e) => {
  const anchor = e.target;
  try {
    const relhref = anchor.getAttribute("href");
    if (!relhref) {
      throw new Error("Anchor href not found");
    }
    const response = await fetch(anchor.href);
    if (!response.ok) {
      throw new Error("Invalid anchor href");
    } else {
      const contentType = response.headers.get("Content-Type");
      if (!contentType || !contentType.includes("image")) {
        throw new Error("Invalid anchor href content type");
      }
    }
  } catch (error) {
    console.error(error);
    anchor.href = "/res/broken-image.png";
    anchor.alt = "Broken Link";
    $(anchor).addClass("broken");
  }
  clearMenu();
  appendItem(imageViewer(anchor.href, anchor.alt));
  const rect = anchor.getBoundingClientRect();
  showMenuAtPos(rect, true);
})
.on("mouseleave", "a", () => {
  if ($(contextMenu).is(".temp")) {
    hideMenu();
  }
});
