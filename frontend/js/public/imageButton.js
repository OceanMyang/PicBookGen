$("#image-button").on("click", async () => {
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
