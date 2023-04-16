let flipped = false; // if we're in the normal orientation or flipped

const swapSides = () => {
  $("#frontImage").css("zIndex", flipped ? 1 : 0);
  $("#backImage").css("zIndex", flipped ? 0 : 1);
  flipped = !flipped;
};

$(document).ready(function () {
  let angle = 0;
  $("#tiltButton").click(function () {
    angle += 15;
    $("#frontImage").css("transform", "rotate(" + angle + "deg)");
    $("#backImage").css("transform", "scaleX(-1) rotate(-" + angle + "deg)");
  });
});
