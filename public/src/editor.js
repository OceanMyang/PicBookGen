$("#editor")
.on("mouseover", (e) => {
  if (e.target.tagName === "A") {
    const href = e.target.href;
    $("#image-viewer").attr("alt", "Loading...");
    $("#image-viewer").attr("src", href);
    console.log(href);
  } else {
    $("#image-viewer").attr("alt", "");
    $("#image-viewer").attr("src", "");
  }
})

$("#upload-file").on("click", () => {
  upload();
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
$("#add-link").on("click", async ()=>{
  const selection = window.getSelection();
  const selectedText = selection.toString();
  if (selectedText && !/^\s+$/.test(selectedText)) {
    const range = selection.getRangeAt(0);
    if (range.startContainer === range.endContainer) {
      const anchor = $('<a/>', {
        class: "view",
        href: "../../src/loading-sm.gif"})
        .css({
          display: "inline-block",
          // pointerEvents: "none",
        })
        .html(selectedText)
        .on("click", (e) => e.preventDefault())
      range.deleteContents();
      range.insertNode(anchor[0]);

      const data = await fetchImage(selectedText);
      
      anchor.attr("href", data.output_url);
    }
  }
})

const upload = () => {
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

const fetchImage = async (text) => {
  const resp = await fetch('https://api.deepai.org/api/text2img', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'api-key': 'b36f8c3e-5420-4371-87ba-8a172be2b5ce'
      },
      body: JSON.stringify({
          text: text,
      })
  });
  
  const data = await resp.json();
  console.log(data);
  return data;
}