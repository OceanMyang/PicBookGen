import { $dumpFile, $dumpFiles, $idContainer } from "./components.js";

if (!$dumpFile.length && !$dumpFiles.length) {
  console.error("Dump file button not found");
}

$dumpFile.on("click", async () => {
  if (confirm("Do you want to move this file to trash?")) {
    var fileID = $idContainer.val();
    await dumpFile(`/delete/${fileID}`, { method: "POST" });
    location.href = "/";
  }
});

$dumpFiles.each((index, button) => {
  var id = $(button).data("id");
  $(button).on("click", async () =>
    dumpFile(`/delete/${id}`).then(() => $(`#${id}`).remove())
  );
});

const dumpFile = async (path) => {
  var response = await fetch(path, { method: "POST" });
  console.log(response);
  if (!response.ok) {
    console.error(response.statusText);
  }
};
