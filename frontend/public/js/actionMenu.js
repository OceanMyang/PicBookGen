import { $actionMenu } from "./components.js";

if (!$actionMenu.length) {
  console.error("Action menu not found");
}

export const showMenuAtPos = (obj) => {
  if (!obj) {
    console.error("The menu must be located relative to an object");
    return;
  }
  var top = obj.top + window.scrollY + obj.height;
  var left = obj.left + window.scrollX;
  if (obj.left + window.scrollX + $actionMenu.width() > window.innerWidth) {
    left = window.innerWidth - $actionMenu.width();
  }
  // Calculate position relative to the whole page
  $actionMenu.css({
    top: `${top}px`,
    left: `${left}px`,
    display: "block",
  });
};

export const showMenu = () => {
  $actionMenu.css("display", "block");
};

export const hideMenu = () => {
  $actionMenu.css("display", "none");
};

export const clearMenu = () => {
  $actionMenu.empty();
};

export const appendItem = ($item) => {
  $actionMenu.append($item);
};

$actionMenu.on("click", (e) => {
  hideMenu();
});
