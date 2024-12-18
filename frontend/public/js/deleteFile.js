import { $deleteFiles } from "./components.js";

$deleteFiles.each((index, button) => {
  var id = $(button).data("id");
  $(button).on("click", async () => {
    if (confirm("Are you sure? This cannot be undone.")) {
      var response = await fetch(`/delete/${id}`, { method: "DELETE" });
      console.log(response);
      if (response.ok) $(`#${id}`).remove();
    }
  });
});
