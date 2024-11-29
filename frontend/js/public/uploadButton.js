$("#upload-button").on("click", () => {
  var input = $("<input/>", {
    type: "file",
    accept: ".txt",
    style: "display: none;",
  }).trigger("click");
  var chosenfile = input.files ? input.files[0] : null;
  if (chosenfile) {
    if (!chosenfile.name.endsWith(".txt")) {
      alert("Please select a .txt file!");
    }
    var response = fetch("/new", {
      method: "POST",
      body: {
        file: chosenfile,
      },
    });
    console.log(response);
  }
});
