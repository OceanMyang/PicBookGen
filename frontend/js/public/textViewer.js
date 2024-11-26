$("#text-viewer").on("mouseover", (e) => {
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
