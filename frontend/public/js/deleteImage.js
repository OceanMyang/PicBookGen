import { $deleteImages } from "./components.js";

$deleteImages.each((index, button) => {
  var params = window.location.pathname.split("/");
  params.pop();
  var fileID = params.pop();
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

export default function deleteLinkByImage(imageID) {
  var basename = imageID.split("/").pop();
  $(`a[href$="${basename}"]`).each((index, anchor) => {
    console.log(anchor);
    $(anchor).replaceWith($(anchor).html());
  });
}
