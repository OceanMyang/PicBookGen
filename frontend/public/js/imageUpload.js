import { $fileSelector, $input, $inputForm } from "./components.js";
import { saveFile } from "./fileSave.js";

if (!$input.length) {
  console.error("No input element found");
}
if (!$inputForm.length) {
  console.error("No input form found");
}

if (!$fileSelector.length) {
  console.error("File selector not found");
}

const handleUploadImage = async () => {
  console.log("Uploading image");
  const selection = window.getSelection();
  const selectedText = selection.toString();
  if (selectedText && !/^\s+$/.test(selectedText)) {
    const range = selection.getRangeAt(0);
    if (range.startContainer === range.endContainer) {
      uploadImage().then((imageID) => {
        const fileID = $fileSelector.val();
        const $anchor = $("<a>", {
          href: `/access/${fileID}/${imageID}`,
          html: selectedText,
          class: "view",
        });
        range.deleteContents();
        range.insertNode($anchor[0]);
        saveFile();
      });
    }
  }
};

async function uploadImage() {
  return new Promise((resolve, reject) => {
    $input.attr({
      type: "file",
      name: "image",
      accept: "image/*",
    });
    $input.trigger("click").on("input", async () => {
      $inputForm
        .on("submit", async (e) => {
          e.preventDefault();

          const formData = new FormData();
          formData.append("image", $input[0].files[0]);
          const fileID = $fileSelector.val();
          try {
            const response = await fetch(`/upload/${fileID}`, {
              method: "POST",
              body: formData,
            });
            if (!response.ok) {
              throw new Error(response.statusText);
            }
            const text = await response.text();
            console.log(text);
            resolve(text); // Resolve the promise with the final result
          } catch (err) {
            console.log(err);
            reject(err); // Reject the promise in case of an error
          }
        })
        .trigger("submit");
    });
  });
}

export const uploadImageButton = () => {
  return $("<button>", {
    id: "upload-image",
    text: "Upload Image",
    class: "dropdown-item",
  }).on("click", handleUploadImage);
};
