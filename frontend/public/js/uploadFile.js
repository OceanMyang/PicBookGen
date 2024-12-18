$("#upload-file").on("click", () => {
  $("#input").attr({
    type: "file",
    name: "file",
    accept: "text/plain",
  });

  $("#input")
    .trigger("click")
    .on("input", () => {
      $("#input-form").submit();
    });
});
