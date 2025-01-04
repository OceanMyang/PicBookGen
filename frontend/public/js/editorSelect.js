import {
  showMenuAtPos,
  clearMenu,
  appendItem,
  setMode,
  MODE,
  getMode,
} from "./contextMenu.js";
import { contextMenu, editor } from "./components.js";
import { reselectImageButton, selectImageButton } from "./imageSelect.js";
import { uploadImageButton } from "./imageUpload.js";
import { deleteLink } from "./components.js";
import { saveFile } from "./fileSave.js";

if (!$(editor).length) {
  console.error("Editor not found");
}

document.addEventListener("selectionchange", (e) => {
  if (getMode() === MODE.VIEW) {
    const selection = window.getSelection();
    const selectedText = selection.toString();
    if (!selectedText || /^\s+$/.test(selectedText)) return;
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    clearMenu();
    appendItem(selectImageButton());
    appendItem(uploadImageButton());
    setMode(MODE.MENU);
    showMenuAtPos(rect);
  }
});

$(editor).on("contextmenu", "a", (e) => {
  e.preventDefault();
  const anchor = e.target;
  window.getSelection().selectAllChildren(anchor);
  clearMenu();
  appendItem(reselectImageButton(anchor));
  appendItem(deleteLinkButton(anchor));
  setMode(MODE.MENU);
  const rect = anchor.getBoundingClientRect();
  showMenuAtPos(rect);
});

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
  if (!selection) {
    console.error("No selection found");
    return false;
  }
  if (selection.rangeCount === 0) {
    console.error("No range selected");
    return false;
  }
  const selectedText = selection.toString();
  const range = selection.getRangeAt(0);
  if (!validateRange(range)) {
    alert(
      "Selection must be text only. Right click to turn links back into text."
    );
    return false;
  }
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
