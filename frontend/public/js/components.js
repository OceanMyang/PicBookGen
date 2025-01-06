export const input = "input[type=file]";
export const fileSelector = "#file-id";
export const imageSelector = "#image-id";
export const editor = "#editor";
export const contextMenu = "#context-menu";
export const imagePanel = "#image-panel";
export const filePanel = "#file-panel";
export const trashPanel = "#trash-panel";
export const fileSave = ".save-file";
export const uploadFile = ".upload-file";
export const dumpFile = ".dump-file";
export const restoreFile = ".restore-file";
export const deleteFile = ".delete-file";
export const uploadImage = ".upload-image";
export const renameFile = ".rename-file";
export const toggle = ".toggle";
export const title = ".title";
export const dialog = ".dialog";
export const closeDialog = ".close-dialog";
export const fileInput = "input[name=file]";
export const imageInput = "input[name=image]";
export const clearImages = ".clear-images";

$(window).on("load", () => {
  window.scrollTo(0, 0);
});

export const deleteLink = (anchor) => {
  if (!anchor || !anchor.href) {
    console.error("Invalid anchor element");
    return;
  }
  $(anchor).replaceWith($(anchor).html());
};

export const deleteLinkByImage = (imageID) => {
  console.log(imageID);
  const basename = imageID.split("/").pop();
  $(`a[href$="${basename}"]`).each((index, anchor) => {
    $(anchor).replaceWith($(anchor).html());
  });
};