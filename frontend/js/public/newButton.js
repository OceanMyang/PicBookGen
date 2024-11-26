$("#new-button").on("click", async () => {
  const response = await fetch("/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(response);
});