$("#editor").on("mouseup", () => {
  addLink();
});

$("#upload-file").on("click", () => {
  callInput();
});

$("#save-file").on("click", async () => {
  const pathname = window.location.pathname;
  const file = $("#editor").html();
  const response = await fetch(pathname, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "same-origin",
    body: JSON.stringify({
      file: file
    })
  })
  console.log(response);
})

const addLink = () => {
  const selection = window.getSelection();
  const selectedText = selection.toString();
  if (selectedText) {
    const range = selection.getRangeAt(0);
    if (range.startContainer === range.endContainer) {
      const anchor = $('<a/>', {
        href: "images/mac.jpeg",
        // style: "pointer-events: none"
      });
      const span = $("<span/>").html(selectedText);
      anchor.append(span);
      range.deleteContents();
      range.insertNode($(anchor)[0]);
    }
  }
}
const callInput = () => {
  const input = $('<input/>', {
    type: 'file',
    style: 'display: none;'
  });
  input.on('change', (e) => {
    const chosenfile = e.target.files ? e.target.files[0] : null;
    if (chosenfile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        file = e.target.result;
        $("#editor").text(file);
      };
      reader.readAsText(chosenfile);
    }
  });
  input.trigger('click');
}