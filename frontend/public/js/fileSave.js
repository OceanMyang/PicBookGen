import { editor, fileSelector, fileSave } from "./components.js";

if (!$(editor).length) {
  console.error("Editor not found");
}

if (!$(fileSelector).length) {
  console.error("File selector not found");
}

if (!$(fileSave).length) {
  console.error("Save file button not found");
}

export async function saveFile() {
  const fileID = $(fileSelector).val();
  if (!fileID) {
    console.error("Invalid file ID");
    return;
  }
  const filebody = $(editor).html();
  const response = await fetch(`/edit/${fileID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filebody: filebody,
    }),
  });
  console.log(response);
}

$(fileSave).on("click", saveFile);

$(document).on("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    saveFile();
  }
});
