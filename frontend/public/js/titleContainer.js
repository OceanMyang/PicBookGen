import { $titleContainer } from "./components.js";

if (!$titleContainer.length) {
  throw new Error("No title container found");
}

$titleContainer
  .on("click", (e) => {
    var filename = $titleContainer.text();
    if (filename === "New File") {
      window.getSelection().selectAllChildren(e.target);
    }
  })
  .on("input", () => {
    var filename = $titleContainer.text();
    if (!filename) {
      $titleContainer.text("New File");
    }
  })
  .on("keypress", (e) => {
    if (e.which === 13) {
      e.preventDefault();
    }
    if (e.which === 32) {
      e.preventDefault();
      var selection = window.getSelection();
      var range = selection.getRangeAt(0); // Get current caret position

      // Insert a space character at the caret position
      var spaceNode = document.createTextNode(" ");
      range.insertNode(spaceNode);

      // Move the caret to the right of the inserted space
      range.setStartAfter(spaceNode);
      range.collapse(true); // Collapse to the new caret position

      // Update the selection to the new caret position
      selection.removeAllRanges();
      selection.addRange(range);
    }
  })
  .on("paste", async (e) => {
    e.preventDefault();
    var rawText = await navigator.clipboard.readText();
    var newFileName = rawText.trim().replace(/(\r\n|\n|\r)/gm, " ");
    $titleContainer.text(newFileName);
  });
