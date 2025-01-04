import { title, fileSelector, renameFile, contextMenu } from "./components.js";

if (!$(title).length) {
  console.error("No title found");
}

export async function saveTitle(filename) {
  const fileID = $(fileSelector).val();
  if (!fileID) {
    console.error("Invalid file ID");
    return;
  }
  const response = await fetch(`/edit/${fileID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename: filename,
    }),
  });
  console.log(response);
}

$(document)
  .on("click", title, (e) => {
    e.preventDefault();
    const $title = $(e.target);
    const selection = window.getSelection();
    if ($title.text() === "New File" && selection) {
      selection.selectAllChildren(e.target);
    }
    const target = e.target.closest(".id-selectable");
    if (!target) return;
    $(fileSelector).val(target.id);
  })
  .on("keypress", title, (e) => {
    if (e.which === 13 || ((e.ctrlKey || e.metaKey) && e.key === "s")) {
      e.preventDefault();
      const $title = $(e.target);
      if (!$title.text().trim()) {
        $title.text("New File");
      }
      $title.trigger("blur");
    }

    if (e.which === 32) {
      e.preventDefault();
      const selection = window.getSelection();
      if (!selection) return;
      const range = selection.getRangeAt(0); // Get current caret position

      // Insert a space character at the caret position
      const spaceNode = document.createTextNode(" ");
      range.insertNode(spaceNode);

      // Move the caret to the right of the inserted space
      range.setStartAfter(spaceNode);
      range.collapse(true); // Collapse to the new caret position

      // Update the selection to the new caret position
      selection.removeAllRanges();
      selection.addRange(range);
    }
  })
  .on("paste", title, async (e) => {
    e.preventDefault();
    const $title = $(e.target);
    const rawText = await navigator.clipboard.readText();
    const newFileName = rawText.trim().replace(/(\r\n|\n|\r)/gm, " ");
    $title.text(newFileName);
  })
  .on("blur", title, (e) => {
    saveTitle($(e.target).text());
  });

$(renameFile).on("click", () => {
  const fileID = $(fileSelector).val();
  if (!fileID) {
    console.error("Invalid file ID");
    return;
  }
  $(contextMenu).trigger("complete");
  $(`#${fileID}`).find(title).trigger("focus");
});
