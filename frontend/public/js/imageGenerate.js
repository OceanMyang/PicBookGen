import { deleteLink, deleteLinkByImage, fileSelector } from "./components.js";
import { textToLink } from "./editorSelect.js";
import { saveFile } from "./fileSave.js";

const handleGenerateImage = async () => {
  if (!textToLink("/res/loading.gif", "view loading")) {
    return;
  }
  const fileID = $(fileSelector).val();
  const selectedText = window.getSelection()?.toString();
  const response = await fetch(`/generate/${fileID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: selectedText }),
  });
  if (response.ok) {
    const imageID = await response.text();
    $("a.view.loading")
      .attr("href", `/access/${fileID}/${imageID}`)
      .attr("alt", `/access/${fileID}/${imageID}`)
      .removeClass("loading")
      .trigger("mouseenter");
    saveFile();
    alert("Image successfully generated!");
  } else {
    alert(await response.text());
    $("a.view.loading").each((index, ele) => {
      deleteLink(ele);
    });
  }
};

export const generateImageButton = () => {
  return $("<button>", {
    text: "Generate Image",
    class: "dropdown-item generate-image",
  }).on("click", handleGenerateImage);
};
