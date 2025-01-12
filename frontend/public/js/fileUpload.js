import { uploadFile, input, fileInput } from "./components.js";

if (!$(uploadFile).length) {
  console.error("No upload file button found");
}

if (!$(input).length) {
  console.error("No input found");
}

$(uploadFile).on("click", () => {
  $(input)
    .attr({
      name: "file",
      accept: "text/plain",
    })
    .trigger("click");
});

$(document).on("input", fileInput, async (e) => {
  const file = e.target.files[0];
  if (!file) {
    console.error("No file selected");
    return;
  }
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`/upload`, {
    method: "POST",
    body: formData,
  });
  $(this).val("");
  if (response.ok) {
    if (response.redirected) {
      window.location = response.url;
    }
  } else {
    alert(await response.text());
  }
});
