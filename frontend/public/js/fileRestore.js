import { restoreFile, fileSelector } from "./components.js";

if (!$(restoreFile).length) {
  console.error("Restore file button not found");
}

const handleRestoreFile = async () => {
  const fileID = $(fileSelector).val();
  if (!fileID) {
    console.error("Invalid file ID");
    return;
  }
  const response = await fetch(`/restore/${fileID}`, { method: "POST" });
  console.log(response);
  if (response.ok) {
    if ($(`#${fileID}`).length) $(`#${fileID}`).remove();
  }
  $(document).trigger("complete");
};

$(restoreFile).on("click", handleRestoreFile);
