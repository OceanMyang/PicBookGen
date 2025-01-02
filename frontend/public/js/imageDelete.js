import { $fileSelector, $imageSelector } from "./components.js";
import { saveFile } from "./fileSave.js";

export const deleteLink = (anchor) => {
  if (!anchor || !anchor.href) {
    console.error("Invalid anchor element");
    return;
  }
  $(anchor).replaceWith($(anchor).html());
};

export const deleteLinkByImage = (imageID) => {
  console.log(imageID);
  const basename = imageID.split("/").pop();
  $(`a[href$="${basename}"]`).each((index, anchor) => {
    console.log(anchor);
    $(anchor).replaceWith($(anchor).html());
  });
};

if (!$fileSelector.length) {
  console.error("File selector not found");
}

if (!$imageSelector.length) {
  console.error("Image selector not found");
}

export const deleteImageButton = () =>
  $("<button>", {
    text: "Delete Image",
    class: "dropdown-item",
  }).on("click", handleDeleteImage);

const handleDeleteImage = async () => {
  if (confirm("Are you sure? All links to this image will be removed.")) {
    const fileID = $fileSelector.val();
    const imageID = $imageSelector.val();
    if (!fileID || !imageID) {
      console.error("Invalid file or image ID");
      return;
    }
    const response = await fetch(`/delete/${fileID}/${imageID}`, {
      method: "DELETE",
    });
    if (response.ok) {
      document.getElementById(imageID).remove();
      deleteLinkByImage(imageID);
      saveFile();
    }
    $(document).trigger("complete");
  }
};
