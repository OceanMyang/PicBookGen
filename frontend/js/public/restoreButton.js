$(".restore-button").each((index, button) => {
  var id = $(button).data("id");
  $(button).on("click", async () => {
    var response = await fetch(`/restore/${id}`, { method: "POST" });
    console.log(response);
    if (response.ok) $(`#${id}`).remove();
  });
});
