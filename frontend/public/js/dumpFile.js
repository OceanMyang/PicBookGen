$("#dump-file").on("click", async () => {
  var path = window.location.pathname.replace("edit", "delete");
  await dumpFile(path);
  window.location = "/";
});

$(".dump-file").each((index, button) => {
  var id = $(button).data("id");
  $(button).on("click", async () =>
    dumpFile(`/delete/${id}`).then(() => $(`#${id}`).remove())
  );
});

const dumpFile = async (path) => {
  var response = await fetch(path, { method: "POST" });
  console.log(response);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
};