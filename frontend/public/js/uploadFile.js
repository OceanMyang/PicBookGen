import { $input, $inputForm, $uploadFile } from "./components.js";

if (!$input.length) {
  throw new Error("No input element found");
}
if (!$inputForm.length) {
  throw new Error("No input form found");
}
if (!$uploadFile.length) {
  throw new Error("No upload file button found");
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
