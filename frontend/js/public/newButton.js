$("#new-button").on("click", async () => {
  var response = await fetch("/new", {
    method: "POST",
    headers: {
      "Content-Type": "text/html",
    },
  });
  console.log(response);
  window.location.href = response.url;
});
