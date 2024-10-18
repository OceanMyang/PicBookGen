$("#upload-button").on("click", () => {
  const input = $("<input/>", {
    type: "file",
    accept: ".txt",
    style: "display: none;",
  }).trigger("click");
  var chosenfile = input.files ? input.files[0] : null;
  console.log(chosenfile);
  if (chosenfile) {
    if (chosenfile.name.endsWith(".txt")) {
      alert("File selected");
    } else {
      alert("Please select a .txt file!");
    }
  }
});
