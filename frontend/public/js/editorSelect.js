import { showMenuAtPos, clearMenu, appendItem, hideMenu, setMode, MODE } from "./contextMenu.js";
import { $contextMenu, $editor } from "./components.js";
import { selectImageButton } from "./imageSelect.js";
import { uploadImageButton } from "./imageUpload.js";

if (!$editor.length) {
  console.error("Editor not found");
}

document.addEventListener("selectionchange", (e) => {
  const selection = window.getSelection();
  const selectedText = selection.toString();
  if (selectedText && !/^\s+$/.test(selectedText)) {
    const range = selection.getRangeAt(0);
    const selectedNode = range.commonAncestorContainer;
    if ($editor.find(selectedNode).length === 0) return;
    const rect = range.getBoundingClientRect();
    clearMenu();
    appendItem(selectImageButton());
    appendItem(uploadImageButton());
    setMode(MODE.MENU);
    showMenuAtPos(rect);
  }
});

