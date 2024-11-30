const save = async () => {
  var pathname = window.location.pathname;
  var fileName = $("#title-container").text();
  var fileBody = $("#text-viewer").html();
  var response = await fetch(pathname, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: fileName,
      fileBody: fileBody,
    }),
  });
  console.log(response);
};

$("#save-button").on("click", save);
$(document).on("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    save();
  }
});
