const sendMessage = (title, message) => {
  var modal = $("#message");
  modal.find(".modal-title").text(title);
  modal.find(".modal-body").text(message);
  modal.modal("show");
  console.log(message);
};

$("#message")
  .find(".close")
  .on("click", () => {
    $("#message").modal("hide");
  });

module.exports = sendMessage;
