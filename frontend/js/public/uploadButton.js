$("#upload-button").on("click", () => {
  const input = $("<input/>", {
    type: "file",
    accept: ".txt",
    style: "display: none;",
  }).trigger("click");
  var chosenfile = input.files ? input.files[0] : null;
  if (chosenfile) {
    if (chosenfile.name.endsWith(".txt")) {
      var response = fetch("/new", {
        method: "POST",
        body: chosenfile,
      });
      console.log(response);
    } else {
      alert("Please select a .txt file!");
    }
  }
});
