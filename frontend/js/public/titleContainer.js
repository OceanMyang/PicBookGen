$("#title-container")
  .on("click", (e) => {
    const fileName = $("#title-container").text();
    if (fileName === "Untitled") {
      window.getSelection().selectAllChildren(e.target);
    }
  })
  .on("input", (e) => {
    const fileName = $("#title-container").text();
    if (!fileName) {
      $("#title-container").text("Untitled");
    }
  })
  .on("keypress", (e) => {
    if (e.which === 13) {
      e.preventDefault();
    }
    if (e.which === 32) {
      e.preventDefault();
      const selection = window.getSelection();
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
  .on("paste", async (e) => {
    e.preventDefault();
    const rawText = await navigator.clipboard.readText();
    const newFileName = rawText.trim().replace(/(\r\n|\n|\r)/gm, " ");
    $("#title-container").text(newFileName);
  });
