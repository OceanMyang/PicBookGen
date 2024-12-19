import { $saveFile } from "./components.js";

if (!$saveFile.length) {
  console.error("Save file button not found");
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
  var filebody = $("#text-container").html();
  var response = await fetch(pathname, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename: filename,
      filebody: filebody,
    }),
  });
  console.log(response);
}
