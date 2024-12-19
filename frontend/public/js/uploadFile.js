import { $input, $inputForm, $uploadFile } from "./components.js";

if (!$input.length) {
  console.error("No input element found");
}
if (!$inputForm.length) {
  console.error("No input form found");
}
if (!$uploadFile.length) {
  console.error("No upload file button found");
}

$uploadFile.on("click", () => {
  $input.attr({
    type: "file",
    name: "file",
    accept: "text/plain",
  });

  $input.trigger("click").on("input", () => {
    $inputForm.submit();
  });
});
