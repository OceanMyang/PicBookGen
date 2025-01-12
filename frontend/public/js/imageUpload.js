import {
  contextMenu,
  fileSelector,
  imageInput,
  imagePanel,
  input,
  uploadImage,
} from "./components.js";
import { textToLink } from "./editorSelect.js";
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
    console.log(response.statusText);
    if (response.ok) {
      const imageID = await response.text();
      $("a.view.loading")
        .attr("href", `/access/${fileID}/${imageID}`)
        .attr("alt", `/access/${fileID}/${imageID}`)
        .removeClass("loading")
        .trigger("mouseenter");
      saveFile();
    } else {
      alert(response.statusText);
      throw new Error(response.statusText);
    }

    $(this).val("");

    const response2 = await fetch(`/access/${fileID}`);
    if (response2.ok) {
      const html = await response2.text();
      $(imagePanel).html(html);
    } else {
      throw new Error(response.statusText);
    }
  } catch (error) {
    console.error(error);
    $(this).val("");
  }
});

const handleUploadImage = () => {
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
  }).on("click", () => {
    if (!textToLink("/res/loading.gif", "view loading")) {
      return;
    }
    handleUploadImage();
  });
};
