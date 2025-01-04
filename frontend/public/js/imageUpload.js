import {
  contextMenu,
  fileSelector,
  imageInput,
  imagePanel,
  input,
  uploadImage,
} from "./components.js";

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
  const fileID = $(fileSelector).val();
  if (!fileID) {
    console.error("Invalid file ID");
    return;
  }
  const file = e.target.files[0];
  if (!file) {
    console.error("No file selected");
    return;
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
    console.error(response.statusText);
  }

  $(this).val("");

  const response2 = await fetch(`/access/${fileID}`);
  if (response2.ok) {
    const html = await response2.text();
    console.log(html);
    $(imagePanel).html(html);
  }
});

const handleUploadImage = () => {
  const selection = window.getSelection();
  const selectedText = selection?.toString();
  if (
    selection &&
    selection.rangeCount > 0 &&
    selectedText &&
    !/^\s+$/.test(selectedText)
  ) {
    const range = selection.getRangeAt(0);
    const $anchor = $("<a>", {
      href: `/res/image.svg`,
      html: selectedText,
      class: "view loading",
    });

    range.deleteContents();
    range.insertNode($anchor[0]);
  }

  $(input)
    .attr({
      name: "image",
      accept: "image/*",
    })
    .trigger("click");
  $(contextMenu).trigger("complete");
};

$(uploadImage).on("click", async () => {
  handleUploadImage();
});

export const uploadImageButton = () => {
  return $("<button>", {
    text: "Upload Image",
    class: "dropdown-item upload-image",
  }).on("click", handleUploadImage);
};
