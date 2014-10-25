$(function() {
  $("#add-modal").easyModal({
    top: 100,
    autoOpen: false,
    overlayOpacity: 0.3,
    overlayColor: "#333",
    overlayClose: false,
    closeOnEscape: true,
    onOpen: on_modal_open,
    onClose: on_modal_close
  });
});

$(function() {
  $("#add-profile-button").click(function(){
    $("#add-modal").trigger('openModal');
  });
});

var on_modal_open = function() {
  // modal is opened
}

var on_modal_close = function() {
  $("#add-modal form").trigger("reset");
}

function close_modal() {
  $("#add-modal").trigger('closeModal');
}