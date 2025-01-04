import { deleteFile, fileSelector } from "./components.js";

if (!$(deleteFile).length) {
  console.error("Delete file button not found");
}

const handleDeleteFile = async () => {
  if (confirm("Are you sure? This cannot be undone.")) {
    const fileID = $(fileSelector).val();
    if (!fileID) {
      console.error("Invalid file ID");
      return;
    }
    const response = await fetch(`/delete/${fileID}`, { method: "DELETE" });
    console.log(response);
    if (response.ok) {
      if ($(`#${fileID}`).length) $(`#${fileID}`).remove();
    }
    $(document).trigger("complete");
  }
};

$(deleteFile).on("click", handleDeleteFile);
