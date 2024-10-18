$("#save-button").on("click", async () => {
  const pathname = window.location.pathname;
  const fileName = $("#title-container").text();
  const fileBody = $("#text-viewer").html();
  const response = await fetch(pathname, {
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
