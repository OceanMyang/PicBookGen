import { contextMenu, fileSelector } from "./components.js";
import { appendItem, clearMenu, showMenu } from "./contextMenu.js";
import { textToLink } from "./editorSelect.js";
import { saveFile } from "./fileSave.js";

const openSelectWindow = async (clickHandle) => {
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
  }).on("click", clickHandle);
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
  if (!textToLink(`/access/${fileID}/${imageID}`, "view")) {
    return;
  }
  saveFile();
  $(contextMenu).trigger("complete");
};

const handleReselectImage = (anchor, e) => {
  if (!anchor || !anchor.href) {
    console.error("Invalid anchor");
    return;
  }
  const target = e.target.closest(".id-selectable");
  if (!target) return;
  const fileID = $(fileSelector).val();
  const imageID = target.id;
  if (!fileID || !imageID) {
    console.error("Invalid file or image ID");
    return;
  }
  anchor.href = `/access/${fileID}/${imageID}`;
  saveFile();
  $(contextMenu).trigger("complete");
};

export const selectImageButton = () => {
  return $("<button>", {
    text: "Select Image",
    class: "dropdown-item select-image",
  }).on("click", () => openSelectWindow(handleSelectImage));
};

export const reselectImageButton = (anchor) => {
  return $("<button>", {
    text: "Relink",
    class: "dropdown-item reselect-image",
  }).on("click", () => {
    openSelectWindow((e) => {
      handleReselectImage(anchor, e);
    });
  });
};
