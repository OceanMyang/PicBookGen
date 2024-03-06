// $("#editor").on("mouseup", () => {
//   const selection = window.getSelection();
//   const selectedText = selection.toString();
//   if (selectedText) {
//     const range = selection.getRangeAt(0);
//     if (range.startContainer === range.endContainer) {
//       const anchor = $('<a href="resources/mac.jpeg"></a>');
//       const span = $("<span></span>").text(selectedText);
//       anchor.append(span);
//       range.deleteContents();
//       range.insertNode($(anchor)[0]);
//     }
//   }
// });

// $("#open-file").on("change", (e) => {
//   const chosenfile = e.target.files ? e.target.files[0] : null;

//   if (chosenfile) {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       file = e.target.result;
//       $("#editor").html(file);
//     };
//     reader.readAsText(chosenfile);
//   }
// });