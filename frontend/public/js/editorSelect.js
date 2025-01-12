import { showMenuAtPos, clearMenu, appendItem } from "./contextMenu.js";
import { contextMenu, editor } from "./components.js";
import { reselectImageButton, selectImageButton } from "./imageSelect.js";
import { uploadImageButton } from "./imageUpload.js";
import { deleteLink } from "./components.js";
import { saveFile } from "./fileSave.js";
import { generateImageButton } from "./imageGenerate.js";

if (!$(editor).length) {
  console.error("Editor not found");
}

if (!$(contextMenu).length) {
  console.error("Context menu not found");
}

document.addEventListener("selectionchange", () => {
  const selection = window.getSelection();
  if (!validateSelection(selection)) {
    return;
  }
  const range = selection.getRangeAt(0);
  if (!validateRange(range)) {
    return;
  }
  const rect = range.getBoundingClientRect();
  clearMenu();
  appendItem(generateImageButton());
  appendItem(selectImageButton());
  appendItem(uploadImageButton());
  showMenuAtPos(rect);
});

$(editor).on("click contextmenu", "a", (e) => {
  e.preventDefault();
  const anchor = e.target;
  window.getSelection()?.selectAllChildren(anchor);
  clearMenu();
  appendItem(reselectImageButton(anchor));
  appendItem(deleteLinkButton(anchor));
  $(contextMenu).removeClass("temp");
  const rect = anchor.getBoundingClientRect();
  showMenuAtPos(rect);
});

export const validateSelection = (selection) => {
  if (!selection || !(selection instanceof Selection)) {
    return false;
  }
  const selectedText = selection.toString();
  if (selection.rangeCount === 0) {
    return false;
  }
  if (!selectedText || /^\s+$/.test(selectedText)) {
    return false;
  }
  return true;
};

export const validateRange = (range) => {
  if (!range || !(range instanceof Range)) {
    console.error("Invalid range");
    return false;
  }
  let valid = true;
  $(editor)
    .find("a.view")
    .each((i, anchor) => {
      if (range.intersectsNode(anchor)) {
        valid = false;
      }
    });
  return valid;
};

export const textToLink = (href, className) => {
  const selection = window.getSelection();
  if (!validateSelection(selection)) {
    alert("Invalid Selection.");
    return false;
  }
  const range = selection.getRangeAt(0);
  if (!validateRange(range)) {
    alert(
      "Selection must be text only. Right click to turn links back into text."
    );
    return false;
  }
  const selectedText = selection.toString();
  const $anchor = $("<a>", {
    href: href,
    html: selectedText,
    class: className,
  });
  range.deleteContents();
  range.insertNode($anchor[0]);
  return true;
};

const deleteLinkButton = (anchor) =>
  $("<button>", {
    text: "Unlink",
    class: "dropdown-item",
    on: {
      click: () => {
        deleteLink(anchor);
        saveFile();
        $(contextMenu).trigger("complete");
      },
    },
  });
