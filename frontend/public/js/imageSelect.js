import { editor, fileSelector } from "./components.js";
import { appendItem, clearMenu, showMenu } from "./contextMenu.js";
import { deleteLink } from "./components.js";
import { saveFile } from "./fileSave.js";

const openSelectWindow = async () => {
  const fileID = $(fileSelector).val();
  if (!fileID) {
    console.error("Invalid file ID");
    return;
  }
  const response = await fetch(`/access/${fileID}`);
  const html = await response.text();
  const $selectionWindow = $("<div>", {
    css: {
      width: "50vw",
    },
    html: html,
  }).on("click", handleSelectImage);
  clearMenu();
  appendItem($selectionWindow);
  showMenu();
};

const handleSelectImage = (e) => {
  const target = e.target.closest(".id-selectable");
  if (!target) return;
  const fileID = $(fileSelector).val();
  const imageID = target.id;
  if (!fileID || !imageID) {
    console.error("Invalid file or image ID");
    return;
  }
  const selection = window.getSelection();
  if (!selection) {
    console.error("No selection found");
    return;
  }
  if (selection.rangeCount === 0) {
    console.error("No range selected");
    return;
  }
  const selectedText = selection.toString();
  const range = selection.getRangeAt(0);
  $(editor)
    .find("a.view")
    .each((i, anchor) => {
      if (range.intersectsNode(anchor)) deleteLink(anchor);
    });
  const $anchor = $("<a>", {
    href: `/access/${fileID}/${imageID}`,
    html: selectedText,
    class: "view",
  });
  range.deleteContents();
  range.insertNode($anchor[0]);
  saveFile();
};

export const selectImageButton = () => {
  return $("<button>", {
    text: "Select Image",
    class: "dropdown-item select-image",
  }).on("click", openSelectWindow);
};
