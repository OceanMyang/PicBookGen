import { contextMenu } from "./components.js";

if (!$(contextMenu).length) {
  console.error("Context menu not found");
}

export const showMenuAtPos = (pos, temp = false) => {
  if (!pos) {
    console.error("The menu must be located relative to an object");
    return;
  }
  let top = pos.top + window.scrollY;
  if (pos.height) {
    top = pos.top + window.scrollY + pos.height;
  }

  let left = pos.left + window.scrollX;
  let width = $(contextMenu).width();
  if (width && pos.left + window.scrollX + width > window.innerWidth) {
    left = window.innerWidth - width;
  }

  // Calculate position relative to the whole page
  $(contextMenu).css({
    top: `${top}px`,
    left: `${left}px`,
    display: "block",
  });

  if (temp) {
    $(contextMenu).addClass("temp");
  }
  else {
    $(contextMenu).removeClass("temp");
  }
};

export const showMenu = () => $(contextMenu).css("display", "block");

export const hideMenu = () => {
  $(contextMenu).css("display", "none");
};

export const clearMenu = () => $(contextMenu).empty();

export const appendItem = ($item) => $(contextMenu).append($item);

$(document).on("complete", hideMenu);

$(document).on("mousedown", (e) => {
  if (!$(e.target).closest(contextMenu).length) {
    hideMenu();
  }
});