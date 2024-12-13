$("#image-button").on("click", async () => {
  var selection = window.getSelection();
  var selectedText = selection.toString();
  if (selectedText && !/^\s+$/.test(selectedText)) {
    var range = selection.getRangeAt(0);
    if (range.startContainer === range.endContainer) {
      var anchor = $("<a/>", {
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

      var temp = await postImage(selectedText);

      anchor.attr("href", temp.output_url);
    }
  }
});

var postImage = async (text) => {
  var response = await fetch("https://api.deepai.org/api/text2img", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": "b36f8c3e-5420-4371-87ba-8a172be2b5ce",
    },
    body: JSON.stringify({
      text: text,
    }),
  });

  var json = await response.json();
  console.log(data);
  return data;
};
