import {
  showMenuAtPos,
  clearMenu,
  appendItem,
  setMode,
  MODE,
  getMode,
} from "./contextMenu.js";
import { contextMenu, editor } from "./components.js";
import { selectImageButton } from "./imageSelect.js";
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
    const selectedNode = range.commonAncestorContainer;
    if ($(editor).find(selectedNode).length === 0) return;
    const rect = range.getBoundingClientRect();
    clearMenu();
    appendItem(selectImageButton());
    appendItem(uploadImageButton());
    setMode(MODE.MENU);
    showMenuAtPos(rect);
  }
});

$(editor).on("contextmenu", "a.view", (e) => {
  e.preventDefault();
  const anchor = e.target;
  window.getSelection().selectAllChildren(anchor);
  clearMenu();
  appendItem(
    $("<button>", {
      text: "Delete Link",
      class: "dropdown-item",
      on: {
        click: () => {
          deleteLink(anchor);
          saveFile();
          $(contextMenu).trigger("complete");
        },
      },
    })
  );
  setMode(MODE.MENU);
  const rect = anchor.getBoundingClientRect();
  showMenuAtPos(rect);
});
