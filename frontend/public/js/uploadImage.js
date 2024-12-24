import { $input, $inputForm } from "./components.js";
import saveFile from "./saveFile.js";

if (!$input.length) {
  console.error("No input element found");
}
if (!$inputForm.length) {
  console.error("No input form found");
}

const handleUploadImage = async () => {
  var selection = window.getSelection();
  var selectedText = selection.toString();
  if (selectedText && !/^\s+$/.test(selectedText)) {
    var range = selection.getRangeAt(0);
    if (range.startContainer === range.endContainer) {
      uploadImage().then((response) => {
        var $anchor = $("<a>", {
          href: response,
          html: selectedText,
          onclick: "event.preventDefault()",
        });
        $anchor.data("id", response);
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
        .submit(async (e) => {
          e.preventDefault();

          var formData = new FormData();
          formData.append("image", $input[0].files[0]);
          var path = window.location.pathname;
          try {
            const response = await fetch(path.replace("edit", "upload"), {
              method: "POST",
              body: formData,
            });
            const text = await response.text();
            console.log(text);
            resolve(text); // Resolve the promise with the final result
          } catch (err) {
            console.log(err);
            reject(err); // Reject the promise in case of an error
          }
        })
        .submit();
    });
  });
}

export var uploadImageButton = () => {
  var button = $("<button>", {
    id: "upload-image",
    text: "Upload Image",
    class: "dropdown-item",
  });
  button.on("click", handleUploadImage);
  return button;
};
