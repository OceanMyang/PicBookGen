import { contextMenu, trashPanel, fileSelector } from "./components.js";
import { showMenuAtPos } from "./contextMenu.js";

if (!$(contextMenu).length) {
  console.error("Context menu not found");
}

if (!$(trashPanel).length) {
  console.error("Trash panel not found");
}

if (!$(fileSelector).length) {
  console.error("File selector not found");
}

const handleFileSelect = (e) => {
  e.preventDefault();
  const target = e.target.closest(".id-selectable");
  if (!target) return;
  const fileID = target.id;
  $(fileSelector).val(fileID);
  showMenuAtPos({ top: e.clientY, left: e.clientX });
};

$(trashPanel).on("contextmenu", handleFileSelect).on("click", handleFileSelect);
