import { deleteUser, dialog, logout } from "./components.js";

$(dialog).on("click", logout, async () => {
  console.log("Logging out");
  const response = await fetch("/logout", { method: "POST" });
  if (response.redirected) {
    window.location = "/login";
  }
})
.on("click", deleteUser, async () => {
  if (confirm("This will delete all of your files and cannot be undone. Are you sure?")) {
    if (confirm("Proceed to delete your account?")) {
      const response = await fetch("/delete", { method: "DELETE" });
      if (response.redirected) {
        window.location = "/login";
      }
    }
  }
});