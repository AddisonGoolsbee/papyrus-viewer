let flipped = false; // if we're in the normal orientation or flipped

const swapSides = () => {
  frontImage = document.getElementById("frontImage");
  backImage = document.getElementById("backImage");

  frontImage.style.zIndex = flipped ? 1 : 0;
  backImage.style.zIndex = flipped ? 0 : 1;
  flipped = !flipped;
};
