$("#save-button").on("click", async () => {
  var pathname = window.location.pathname;
  var fileName = $("#title-container").text();
  var fileBody = $("#text-viewer").html();
  var response = await fetch(pathname, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "same-origin",
    body: JSON.stringify({
      fileName: fileName,
      fileBody: fileBody,
    }),
  });
  console.log(response);
});
