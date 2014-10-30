$(document).ready(function(){
  setHeight();
});

$(window).resize(function(){
  setHeight();
});

var setHeight = function() {
  $(document.body).scroll(function() {
    var top = $("#all-content").position()['top'];
    top = Math.abs(top);
    $("#add-modal").css('top', top);
    $("#activity-feed").css('top', top);
    $("#profiles").css('top', top);
  });
};

