$("#new-button").on("click", async () => {
  const pathname = window.location.pathname;
  const response = await fetch(pathname, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "same-origin",
    body: JSON.stringify({
      fileName: "Untitled",
    }),
  });
  console.log(response);
});
