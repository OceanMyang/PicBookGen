$(".delete-button").each((index, button) => {
  var id = $(button).data("id");
  $(button).on("click", async () => {
    console.log(id);
    var response = await fetch(`/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "text/html",
      },
    });
    console.log(response);
    window.location.href = response.url;
  });
});
