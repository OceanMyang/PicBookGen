import { $input, $inputForm, $uploadImage } from "./components.js";
import saveFile from "./saveFile.js";

if (!$input.length) {
  throw new Error("No input element found");
}
if (!$inputForm.length) {
  throw new Error("No input form found");
}
if (!$uploadImage.length) {
  throw new Error("No upload image button found");
}

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

$uploadImage.on("click", async () => {
  var selection = window.getSelection();
  var selectedText = selection.toString();
  if (selectedText && !/^\s+$/.test(selectedText)) {
    var range = selection.getRangeAt(0);
    if (range.startContainer === range.endContainer) {
      var $anchor = $("<a>", {
        href: "/res/loading-sm.gif",
        html: selectedText,
        onclick: "event.preventDefault()",
        display: "inline-block",
      });
      range.deleteContents();
      range.insertNode($anchor[0]);

      var response = await uploadImage();
      $anchor.attr("href", response);
      $anchor.data("id", response);
      saveFile();
    }
  }
});
