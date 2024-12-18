const saveFile = async () => {
  var pathname = window.location.pathname;
  var filename = $("#title-container").text();
  var fileBody = $("#text-viewer").html();
  var response = await fetch(pathname, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename: filename,
      fileBody: fileBody,
    }),
  });
  console.log(response);
};

$("#save-file").on("click", saveFile);
$(document).on("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    saveFile();
  }
});

export default saveFile;