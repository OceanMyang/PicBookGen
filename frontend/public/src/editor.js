$("#file-name")
  .on("click", (e) => {
    const fileName = $("#file-name").text();
    if (fileName === "Untitled") {
      window.getSelection().selectAllChildren(e.target);
    }
  })
  .on("input", (e) => {
    const fileName = $("#file-name").text();
    if (!fileName) {
      $("#file-name").text("Untitled");
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
    $("#file-name").text(newFileName);
  });

$("#editor").on("mouseover", (e) => {
  if (e.target.tagName === "A") {
    const href = e.target.href;
    $("#image-viewer").attr("alt", "Loading...");
    $("#image-viewer").attr("src", href);
    console.log(href);
  } else {
    $("#image-viewer").attr("alt", "");
    $("#image-viewer").attr("src", "");
  }
});

$("#new-file").on("click", async () => {
  const pathname = window.location.pathname;
  const response = await fetch(pathname, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "same-origin",
    body: JSON.stringify({
      fileName: "test",
      file: "",
    }),
  });
  console.log(response);
});

$("#upload-file").on("click", () => {
  const input = $("<input/>", {
    type: "file",
    accept: ".txt",
    style: "display: none;",
  });
  input.on("change", (e) => {
    const chosenfile = e.target.files ? e.target.files[0] : null;
    if (chosenfile) {
      if (chosenfile.name.endsWith(".txt")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          file = e.target.result;
          $("#editor").text(file);
        };
        reader.readAsText(chosenfile);
      } else {
        sendMessage("Invalid File Type", "Please select a .txt file!");
      }
    }
  });
  input.trigger("click");
});

$("#save-file").on("click", async () => {
  const pathname = window.location.pathname;
  const fileName = $("#file-name").text();
  const fileBody = $("#editor").html();
  const response = await fetch(pathname, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "same-origin",
    body: JSON.stringify({
      fileName: fileName,
      fileBody: fileBody,
    }),
  });
  console.log(response);
});

$("#add-link").on("click", async () => {
  const selection = window.getSelection();
  const selectedText = selection.toString();
  if (selectedText && !/^\s+$/.test(selectedText)) {
    const range = selection.getRangeAt(0);
    if (range.startContainer === range.endContainer) {
      const anchor = $("<a/>", {
        class: "view",
        href: "../../res/loading-sm.gif",
      })
        .css({
          display: "inline-block",
          // pointerEvents: "none",
        })
        .html(selectedText)
        .on("click", (e) => e.preventDefault());
      range.deleteContents();
      range.insertNode(anchor[0]);

      const temp = await postImage(selectedText);

      anchor.attr("href", temp.output_url);
    }
  }
});

const postImage = async (text) => {
  const resp = await fetch("https://api.deepai.org/api/text2img", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": "b36f8c3e-5420-4371-87ba-8a172be2b5ce",
    },
    body: JSON.stringify({
      text: text,
    }),
  });

  const data = await resp.json();
  console.log(data);
  return data;
};

const sendMessage = (title, message) => {
  var modal = $("#message");
  modal.find(".modal-title").text(title);
  modal.find(".modal-body").text(message);
  modal.modal("show");
  console.log(message);
};

$("#message")
  .find(".close")
  .on("click", () => {
    $("#message").modal("hide");
  });