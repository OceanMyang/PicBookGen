import { appendItem, clearMenu, showMenu } from "./actionMenu.js";

function handleSelectImage() {
  clearMenu();
  appendItem(
    $("<iframe>", {
      id: "selection-window",
      src: "./images",
    })
  );
  showMenu();
}

export const selectionWindow = $("iframe", {
  id: "selection-window",
  src: "./images",
});

export const selectImageButton = () => {
  return $("<button>", {
    id: "select-image",
    text: "Select Image",
    class: "dropdown-item",
  }).on("click", handleSelectImage);
};
