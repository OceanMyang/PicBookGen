$(".delete-button").each((index, button) => {
  var id = $(button).data("id");
  $(button).on("click", async () => {
    var response = await fetch(`/delete/${id}`, { method: "DELETE" });
    console.log(response);
    if (response.ok) $(`#${id}`).remove();
  });
});
