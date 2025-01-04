import {
  contextMenu,
  deleteLink,
  editor,
  fileSelector,
  imageInput,
  imagePanel,
  input,
  uploadImage,
} from "./components.js";
import { textToLink, validateRange } from "./editorSelect.js";
import { saveFile } from "./fileSave.js";

if (!$(contextMenu).length) {
  console.error("Context menu not found");
}

if (!$(fileSelector).length) {
  console.error("File selector not found");
}

if (!$(input).length) {
  console.error("input not found");
}

$(document).on("input", imageInput, async (e) => {
  try {
    const fileID = $(fileSelector).val();
    if (!fileID) {
      throw new Error("Invalid file ID");
    }
    const file = e.target.files[0];
    if (!file) {
      throw new Error("No file selected");
    }
    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch(`/upload/${fileID}`, {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      const imageID = await response.text();
      $("a.view.loading")
        .attr("href", `/access/${fileID}/${imageID}`)
        .removeClass("loading");
      saveFile();
    } else {
      throw new Error(response.statusText);
    }

    $(this).val("");

    const response2 = await fetch(`/access/${fileID}`);
    if (response2.ok) {
      const html = await response2.text();
      $(imagePanel).html(html);
    }
  } catch (error) {
    console.error(error);
    $(this).val("");
  }
});

const handleUploadImage = () => {
  if (!textToLink("/res/loading.gif", "view loading")) {
    return;
  }
  $(input)
    .attr({
      name: "image",
      accept: "image/*",
    })
    .trigger("click");
  $(contextMenu).trigger("complete");
};

$(uploadImage).on("click", handleUploadImage);

export const uploadImageButton = () => {
  return $("<button>", {
    text: "Upload Image",
    class: "dropdown-item upload-image",
  }).on("click", handleUploadImage);
};
