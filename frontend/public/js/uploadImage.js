$("#upload-image").on("click", () => {
  uploadImage();
  // var selection = window.getSelection();
  // var selectedText = selection.toString();
  // if (selectedText && !/^\s+$/.test(selectedText)) {
  //   var range = selection.getRangeAt(0);
  //   if (range.startContainer === range.endContainer) {
  //     var anchor = $("<a/>", {
  //       class: "view",
  //       href: "/res/loading-sm.gif",
  //     })
  //       .css({
  //         display: "inline-block",
  //         // pointerEvents: "none",
  //       })
  //       .html(selectedText)
  //       .on("click", (e) => e.preventDefault());
  //     range.deleteContents();
  //     range.insertNode(anchor[0]);

  //     anchor.attr("href", response.output_url);
  //   }
  // }
});

const uploadImage = () => {
  $("#input").attr({
    type: "file",
    name: "image",
    accept: "image/*",
  });

  $("#input")
    .trigger("click")
    .on("input", () => {
      $("#input-form")
        .submit(async (e) => {
          e.preventDefault();

          var formData = new FormData();
          formData.append("image", $("#input")[0].files[0]);
          var path = window.location.pathname;
          var response = await fetch(path.replace("edit", "upload"), {
            method: "POST",
            body: formData,
          })
            .then((response) => response.text())
            .catch((error) => console.error(error));
          console.log(response);
        })
        .submit();
    });
};
