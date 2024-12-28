import { $deleteImages, $idContainer } from "./components.js";

if (!$deleteImages.length) {
  console.error("Delete image button not found");
}

if (!$idContainer.length) {
  console.error("ID container not found");
}

$deleteImages.each((index, button) => {
  var fileID = $idContainer.val();
  var imageID = $(button).data("id");
  $(button).on("click", async () => {
    if (confirm("Are you sure? This cannot be undone.")) {
      var response = await fetch(`/delete/${fileID}/${imageID}`, {
        method: "DELETE",
      });
      console.log(response);
      if (response.ok) document.getElementById(imageID).remove();
    }
  });
});

export function deleteLinkByImage(imageID) {
  var basename = imageID.split("/").pop();
  $(`a[href$="${basename}"]`).each((index, anchor) => {
    console.log(anchor);
    $(anchor).replaceWith($(anchor).html());
  });
}
