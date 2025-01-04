import { clearImages, fileSelector, imageSelector } from "./components.js";
import { saveFile } from "./fileSave.js";

if (!$(fileSelector).length) {
  console.error("File selector not found");
}

if (!$(imageSelector).length) {
  console.error("Image selector not found");
}

const handleDeleteImage = async () => {
  if (confirm("Are you sure? All links to this image will be removed.")) {
    const fileID = $(fileSelector).val();
    const imageID = $(imageSelector).val()?.toString();
    if (!fileID || !imageID) {
      console.error("Invalid file or image ID");
      return;
    }
    const response = await fetch(`/delete/${fileID}/${imageID}`, {
      method: "DELETE",
    });
    if (response.ok) {
      const imageEle = document.getElementById(imageID);
      if (imageEle) imageEle.remove();
      deleteLinkByImage(imageID);
      saveFile();
    }
    $(document).trigger("complete");
  }
};

const handleClearImages = async () => {
  if (
    confirm(
      "Are you sure? All images and all links will be removed. This cannot be undone."
    )
  ) {
    const fileID = $(fileSelector).val();
    if (!fileID) {
      console.error("Invalid file");
      return;
    }
    const response = await fetch(`/delete/${fileID}/all`, {
      method: "DELETE",
    });
    if (response.ok) {
      $(".id-selectable[id]").each((index, imageEle) => {
        const imageID = imageEle.id
        deleteLinkByImage(imageID);
        imageEle.remove();
      });
      saveFile();
    }
    $(document).trigger("complete");
  }
};

$(clearImages).on("click", handleClearImages);

export const deleteImageButton = () =>
  $("<button>", {
    text: "Delete",
    class: "dropdown-item delete-image",
  }).on("click", handleDeleteImage);
