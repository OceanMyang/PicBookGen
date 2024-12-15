const dump = async (path) => {
  var response = await fetch(path, { method: "POST" });
  console.log(response);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
};

$("#dump-file").on("click", async () => {
  var path = window.location.pathname.replace("edit", "delete");
  await dump(path);
  window.location = "/";
});

$(".dump-file").each((index, button) => {
  var id = $(button).data("id");
  $(button).on("click", async () =>
    dump(`/delete/${id}`).then(() => $(`#${id}`).remove())
  );
});
