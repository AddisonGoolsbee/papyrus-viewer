let flipped = false; // if we're in the normal orientation or flipped

const swapSides = () => {
  frontImage = document.getElementById("frontImage");
  backImage = document.getElementById("backImage");

  frontImage.style.zIndex = flipped ? 1 : 0;
  backImage.style.zIndex = flipped ? 0 : 1;
  flipped = !flipped;
};

$(document).ready(function() {
  var angle = 0;
  $('#tiltButton').click(function() {
    angle += 15;
    $('#frontImage, #backImage').css('transform', 'rotate(' + angle + 'deg)');
  });
});


