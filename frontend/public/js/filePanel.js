import { $contextMenu, $filePanel, $fileSelector, $renameFile } from "./components.js";
import { appendItem, clearMenu, showMenuAtPos } from "./contextMenu.js";

if (!$contextMenu.length) {
  console.error("Context menu not found");
}

if (!$filePanel.length) {
  console.error("File panel not found");
}

if (!$fileSelector.length) {
  console.error("File selector not found");
}

const handleFileSelect = (e) => {
  e.preventDefault();
  const target = e.target.closest(".id-selectable");
  if (!target) return;
  const fileID = target.id;
  $contextMenu.find("a.read").attr("href", `/read/${fileID}`);
  $fileSelector.val(fileID);
  showMenuAtPos({ top: e.clientY, left: e.clientX });
};

$filePanel
  .on("contextmenu", handleFileSelect)
  .on("click", ".option", handleFileSelect);

$renameFile.on("click", () => {
  const fileID = $fileSelector.val();
  if (!fileID) {
    console.error("Invalid file ID");
    return;
  }
  $contextMenu.trigger("complete");
  $(`#${fileID} .title`).trigger("focus");
});