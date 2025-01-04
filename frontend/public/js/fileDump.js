import { dumpFile, fileSelector } from "./components.js";

if (!$(dumpFile).length) {
  console.error("Dump file button not found");
}

const handleDumpFile = async () => {
  if (confirm("Do you want to move this file to trash?")) {
    const fileID = $(fileSelector).val();
    if (!fileID) {
      console.error("Invalid file ID");
      return;
    }
    const response = await fetch(`/delete/${fileID}`, { method: "POST" });
    console.log(response);
    if (response.ok) {
      window.location.href = response.url;
    }
    $(document).trigger("complete");
  }
};

$(dumpFile).on("click", handleDumpFile);
