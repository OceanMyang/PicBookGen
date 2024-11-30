const dump = async (path) => {
  console.log(path);
  var response = await fetch(path, { method: "POST" });
  console.log(response);
};

$("#dump-button").on("click", async () => {
  var path = window.location.pathname.replace("edit", "delete");
  await dump(path);
  window.location = "/";
});

$(".dump-button").each((index, button) => {
  var id = $(button).data("id");
  $(button).on("click", async () => await dump(`/delete/${id}`));
  if (response.ok) $(`#${id}`).remove();
});
