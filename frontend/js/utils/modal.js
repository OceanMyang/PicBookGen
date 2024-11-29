const sendMessage = (title, message) => {
  var modal = $("#modal");
  modal.find(".modal-title").text(title);
  modal.find(".modal-body").text(message);
  modal.modal("show");
  console.log(message);
};

$("#modal")
  .find(".close")
  .on("click", () => {
    $("#modal").modal("hide");
  });

module.exports = sendMessage;
