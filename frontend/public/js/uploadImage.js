import saveFile from "./saveFile.js";

async function uploadImage() {
  return new Promise((resolve, reject) => {
    $("#input").attr({
      type: "file",
      name: "image",
      accept: "image/*",
    });
    $("#input")
      .trigger("click")
      .on("input", async () => {
        $("#input-form")
          .submit(async (e) => {
            e.preventDefault();

            var formData = new FormData();
            formData.append("image", $("#input")[0].files[0]);
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

$("#upload-image").on("click", async () => {
  var selection = window.getSelection();
  var selectedText = selection.toString();
  if (selectedText && !/^\s+$/.test(selectedText)) {
    var range = selection.getRangeAt(0);
    if (range.startContainer === range.endContainer) {
      var anchor = $("<a/>", {
        class: "view",
        href: "/res/loading-sm.gif",
      })
        .css({
          display: "inline-block",
          // pointerEvents: "none",
        })
        .html(selectedText)
        .on("click", (e) => e.preventDefault());
      range.deleteContents();
      range.insertNode(anchor[0]);

      var response = await uploadImage();
      anchor.attr("href", response);
      anchor.data("id", response);
      saveFile();
    }
  }
});