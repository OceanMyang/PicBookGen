import {
  toggle,
  imagePanel,
  fileSelector,
  imageSelector,
} from "./components.js";
import { appendItem, clearMenu, showMenuAtPos } from "./contextMenu.js";
import { deleteImageButton } from "./imageDelete.js";

if (!$(toggle).length) {
  console.error("Toggle is not found");
}

if (!$(imagePanel).length) {
  console.error("Image Panel not found");
}

if (!$(fileSelector).length) {
  console.error("File selector not found");
}

$(toggle).on("click", () => {
  $(".toggleable").toggleClass("hidden");
  $(imagePanel).trigger("show");
});

$(imagePanel)
  .on("show", async () => {
    const fileID = $(fileSelector).val();
    if (!fileID) {
      console.error("Invalid file ID");
      return;
    }
    const response = await fetch(`/access/${fileID}`);
    if (response.ok) {
      const html = await response.text();
      $(imagePanel).html(html);
    } else {
      alert(await response.text());
    }
  })
  .on("click", "img.view", (e) => {
    e.preventDefault();
    const src = e.target.src;
    if (!src) return;
    window.location = src;
  })
  .on("contextmenu", (e) => {
    e.preventDefault();
    const target = e.target.closest(".id-selectable");
    if (!target) return;
    $(imageSelector).val(target.id);
    clearMenu();
    appendItem(deleteImageButton());
    showMenuAtPos({ top: e.clientY, left: e.clientX });
  });
