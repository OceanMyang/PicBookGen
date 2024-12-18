import { $saveFile } from "./components.js";

if (!$saveFile.length) {
  throw new Error("Save file button not found");
}

$saveFile.on("click", saveFile);
$(document).on("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    saveFile();
  }
});

export default async function saveFile() {
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
}
