import {
  hideMenu,
  showMenuAtPos,
  clearMenu,
  appendItem,
} from "./actionMenu.js";
import { $textContainer } from "./components.js";
import { selectImageButton } from "./selectImage.js";
import { uploadImageButton } from "./uploadImage.js";

if (!$textContainer.length) {
  console.error("Text container not found");
}

document.addEventListener("selectionchange", (e) => {
  var selection = window.getSelection();
  var selectedText = selection.toString();
  if (selectedText) {
    var range = selection.getRangeAt(0);
    var selectedNode = range.commonAncestorContainer;
    if ($textContainer.find(selectedNode).length === 0) {
      return;
    }

    // Get the bounding rectangle of the selected text
    var rect = range.getBoundingClientRect();
    clearMenu();
    appendItem(uploadImageButton());
    appendItem(selectImageButton());
    showMenuAtPos(rect);
  }
});