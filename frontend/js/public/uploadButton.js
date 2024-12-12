$("#upload-button").on("click", () => $("#input").trigger("click"));

$("#input").on("input", () => {
  $("#input-form").submit();
});
