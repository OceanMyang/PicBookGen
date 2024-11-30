$("#new-button").on("click", async () => {
  var response = await fetch("/new", { method: "POST" });
  console.log(response);
  if (response.url) window.location = response.url;
});
