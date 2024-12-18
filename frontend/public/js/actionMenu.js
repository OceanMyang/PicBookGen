import { $actionMenu, $textViewer } from "./components.js";

if (!$actionMenu.length) {
  throw new Error("Action menu not found");
}
if (!$textViewer.length) {
  throw new Error("Text viewer not found");
}

const showMenu = (e) => {
  e.preventDefault();
  $actionMenu.css({
    top: `${e.clientY}px`,
    left: `${e.clientX}px`,
    display: "block",
  });
}

const hideMenu = () => {
  $actionMenu.css("display", "none");
}

// Show custom context menu on text selection
$textViewer.on("contextmenu", (e) => {
  showMenu(e);
});

// Hide menu when clicking anywhere else
$(document).on("click", hideMenu);
