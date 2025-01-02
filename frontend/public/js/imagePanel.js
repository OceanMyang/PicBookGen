import {
  $toggle,
  $imagePanel,
  $editor,
  $fileSelector,
  $imageSelector,
} from "./components.js";
import { appendItem, clearMenu, showMenuAtPos } from "./contextMenu.js";
import { deleteImageButton } from "./imageDelete.js";
import { uploadImageButton } from "./imageUpload.js";

if (!$toggle.length) {
  console.error("Toggle is not found");
}

if (!$imagePanel.length) {
  console.error("Image Panel not found");
}

if (!$editor.length) {
  console.error("Editor not found");
}

if (!$fileSelector.length) {
  console.error("File selector not found");
}

$toggle.on("click", () => {
  $editor.toggle();
  $imagePanel.trigger("show");
  $imagePanel.toggle();
  if ($editor.is(":visible")) {
    $toggle.text("Images");
  }
  if ($imagePanel.is(":visible")) {
    $toggle.text("Editor");
  }
});

$imagePanel
  .on("show", async () => {
    const fileID = $fileSelector.val();
    if (!fileID) {
      console.error("Invalid file ID");
      return;
    }
    const response = await fetch(`/access/${fileID}`);
    if (response.ok) {
      const html = await response.text();
      $imagePanel.html(html);
    }
  })
  .on("click contextmenu", (e) => {
    e.preventDefault();
    const target = e.target.closest(".id-selectable");
    if (!target) return;
    $imageSelector.val(target.id);
    clearMenu();
    appendItem(deleteImageButton());
    showMenuAtPos({ top: e.clientY, left: e.clientX });
  });
