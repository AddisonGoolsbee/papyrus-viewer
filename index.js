// python3 -m http.server 8000

// jQuery draggable patch to support CSS transforms
//   Workaround for https://bugs.jqueryui.com/ticket/6844
//   From https://stackoverflow.com/a/18606402
(function ($) {
  var __dx, __dy;
  var __recoupLeft, __recoupTop;

  var parseIntSafe = function (value) {
    return (function (n) {
      return isNaN(n) ? 0 : n;
    })(parseInt(value, 10));
  };

  $.fn.draggablePatched = function (options) {
    options = options || {};
    return this.draggable({
      cursor: options.cursor || 'move',
      zIndex: 100,
      drag: function(event, ui) {
        __dx = ui.position.left - ui.originalPosition.left;
        __dy = ui.position.top - ui.originalPosition.top;
        ui.position.left = ui.originalPosition.left + __dx + __recoupLeft;
        ui.position.top = ui.originalPosition.top + __dy + __recoupTop;
        if (options.drag) {
          options.drag(event, ui);
        }
      },
      start: function(event, ui) {
        var left = parseIntSafe($(this).css('left'));
        var top = parseIntSafe($(this).css('top'));
        __recoupLeft = left - ui.position.left;
        __recoupTop = top - ui.position.top;
        if (options.start) {
          options.start(event, ui);
        }
      },
      stop: function() {
        if (options.stop) {
          options.stop.call(this);
        }
      },
      create: function() {
        if (options.create) {
          options.create.call(this);
        }
      }
    });
  };
})(jQuery);

function fragmentFlip() {
  if (abilityToFlip == false)
  {
    return;
  }
  if ($(this).attr("src").includes("background.png")) {
    return;
  }

  let width = $(this).get(0).clientWidth;

  let newSrc = "";
  if ($(this).attr("src").includes("front.png")) {
    newSrc = $(this).attr("src").replace("front.png", "back.png");
  } else {
    newSrc = $(this).attr("src").replace("back.png", "front.png");
  }
  //update text of image
  var paragraph = document.querySelector('#metadata-fragment');
  var src = newSrc
  var filename_full = src.split("/").pop().split('.')[0];
  var fragment_idx = Number(filename_full.split('_')[0].replace("fragment", ""));
  var filename = "F" + fragment_idx.toString();
  var side = filename_full.split('_')[1]
  paragraph.innerHTML = `${filename}, ${side}: No transcription.`

  if ($("#enableAnimate").is(":checked")) {
    let duration = 300;
    $(this).animate({ width: "0px", marginLeft: `${width / 2}px` }, duration, "swing", function () {
      $(this).attr("src", newSrc);
      $(this).animate({ width: width, marginLeft: `0px` }, duration, "swing");
    });
  } else {
    $(this).attr("src", newSrc);
    $(this).one("load", function() {
      $(this).css("width", `${width}px`);
    });
  }
}

let abilityToFlip = true;
function loadFragmentImages(fragments, path) {
  removeRotateHandle();
  $("#imageContainer img").remove();

  let bg_img = $("<img id='background'></img>");
  bg_img.css("zIndex", -1);
  if (!$("#showBackground").is(":checked")) {
    bg_img.css("opacity", 0);
  }

  $("#imageContainer").append(bg_img);
  bg_img.attr("src", `${path}/fragments/background.png`);

  bg_img.on("load", function () {
    $("#imageContainer").css("width", bg_img.get(0).naturalWidth);
  });

  for (f in fragments) {
    let f_img = $("<img></img>");
    $("#imageContainer").append(f_img);

    f_img.css("left", fragments[f].split(",")[0] + "px");
    f_img.css("top", fragments[f].split(",")[1] + "px");

    f_img.on("load", function () {
      $(this).css("width", $(this).get(0).naturalWidth);
      $(this).css("height", $(this).get(0).naturalHeight);
    });
    f_img.attr("src", `${path}/fragments/${f}_front.png`);
  }

  $("#imageContainer img").each(function () {
    if (this.complete) {
      $(this).trigger("load");
    }
  });

  $("#imageContainer img").dblclick(fragmentFlip);

  $("#imageContainer img").draggablePatched({
    containment: 'img[src$="background.png"]',
    start: function () {
     $(".rotate-handle").remove();
     $(this).css("outline", "2px dashed red");
    },
    stop: function () {
     $(this).css("outline", "none");
    },
  });
  $("#imageContainer img").click(selectImage);

  zindex = 0;
  let ctx = document.createElement("canvas").getContext("2d");
  $("#imageContainer img").on("mousedown", function (event) {
    let x = event.pageX;
    let y = event.pageY;
    let w = $(this).prop("naturalWidth");
    let h = $(this).prop("naturalHeight");
    ctx.canvas.width = w;
    ctx.canvas.height = h;

    let offset = $(this).offset();

    image = new Image();
    image.src = $(this).attr("src");
    ctx.drawImage(image, 0, 0, w, h);

    alpha = ctx.getImageData(Math.floor(x - offset.left), Math.floor(y - offset.top), 1, 1).data[3]; // [0]R [1]G [2]B [3]A

    if (alpha === 0) {
      this.style.pointerEvents = "none";
      $(document.elementFromPoint(event.clientX, event.clientY)).trigger("click");
      this.style.pointerEvents = "auto";
    }
  });
}

function selectImage() {
  if ($('body').css('cursor') === 'zoom-in') {
    // Check if the image is already enlarged
    if ($(this).data("enlarged")) {
      $(this).css({
        width: $(this).data("origWidth"),
        height: $(this).data("origHeight"),
        position: 'absolute',
        top: $(this).data("origTop") + 'px',
        left: $(this).data("origLeft") + 'px',
      });
      $(this).removeData("enlarged");
      abilityToFlip = true;
    } else {
      // Store original position and size
      var origWidth = $(this).width();
      var origHeight = $(this).height();
      var origTop = $(this).position().top;
      var origLeft = $(this).position().left;
      

      // Enlarge the image
      abilityToFlip = false;
      $(".rotate-handle").remove();
      $(this).css({
        width: origWidth * 2,
        height: origHeight * 2,
        position: 'absolute',
        top: origTop - origHeight / 2 + 'px',
        left: origLeft - origWidth / 2 + 'px',
      });
      $(this).data({
        enlarged: true,
        origWidth: origWidth,
        origHeight: origHeight,
        origTop: origTop,
        origLeft: origLeft,
      });
    }
  }

  if ($(this).attr("src").includes("background.png")) {
    return;
  }

  $(this).css("z-index", zindex + 1);
  zindex = zindex + 1;
  // Remove outline and selected class from other images
  $("#imageContainer img").css("outline", "none").removeClass("selected");

  // Add outline and selected class to selected image
  $(this).css("outline", "2px dashed red").addClass("selected");

  // Remove rotate handle from previously selected image
  $(".rotate-handle").remove();

  // Add rotate handle to the border of selected image
  let handle = $("<div class='rotate-handle'></div>");
  handle.appendTo($(this).parent());
  let handleSize = handle.outerWidth(true);

  handle.css({
    left: $(this).position().left + $(this).outerWidth() / 2 + "px",
    top: $(this).position().top - handleSize / 2 + "px",
  });
  handle.prepend($("<img>", { src: "rotate-icon-transparent.png" }).addClass("selected").attr("height", "20px").attr("width", "20px"));

  // Make the rotate handle rotatable by the mouse
  let selectedImg = $(".selected");
  let startX, startY, startAngle;

  const box = this;
  const rotator = handle;

  handle.on("mousedown", function (e) {
    e.preventDefault();
    startX = e.pageX;
    startY = e.pageY;
    startAngle = parseInt(selectedImg.data("rotation")) || 0;

    $(document).on("mousemove", rotateImage);
    $(document).on("mouseup", function () {
      $(document).off("mousemove", rotateImage);
    });
  });

  function rotateBox(deg) {
    $(box).css("transform", "rotate(" + deg + "deg)"); // <=
  }

  function rotateImage(event) {
    initX = box.offsetLeft;
    initY = box.offsetTop;
    mousePressX = event.clientX;
    mousePressY = event.clientY;

    const arrowRects = box.getBoundingClientRect();
    const arrowX = arrowRects.left + arrowRects.width / 2;
    const arrowY = arrowRects.top + arrowRects.height / 2;

    function eventMoveHandler(event) {
      const angle = Math.atan2(event.clientY - arrowY, event.clientX - arrowX) + Math.PI / 2;
      rotateBox((angle * 180) / Math.PI);
    }

    window.addEventListener("mousemove", eventMoveHandler, false);
    window.addEventListener(
      "mouseup",
      function eventEndHandler() {
        window.removeEventListener("mousemove", eventMoveHandler, false);
        window.removeEventListener("mouseup", eventEndHandler);
      },
      false
    );
  }
}

function loadItem() {
  removeRotateHandle();
  let doc = $("#documentSelector option:selected").val();
  let item = Number($("#itemSelector option:selected").val()).toString().padStart(2, "0");
  let path = `documents/${doc}/${item}`;

  fetch(path + "/fragments/fragments.json")
    .then((response) => response.json())
    .then((data) => {
      loadFragmentImages(data, path);
    });
}

function buildItemSelector(item_counts) {
  $("#itemSelector option").remove();
  let count = item_counts[$("#documentSelector option:selected").val()];
  for (let i = 1; i <= count; i++) {
    $("#itemSelector").append(`<option value=${i}> Frame #${i}</option>`);
  }
  $("#itemSelector").on("change", loadItem);
  loadItem();
}

function buildPapyrusSelector(item_counts) {
  $("#documentSelector option").remove();
  for (p in item_counts) {
    $("#documentSelector").append(`<option value=${p}>${p} (${item_counts[p]} frame${item_counts[p] > 1 ? "s" : ""})</option>`);
  }
  buildItemSelector(item_counts);
  function refreshItemSelect() {
    buildItemSelector(item_counts);
  }
  $("#documentSelector").on("change", refreshItemSelect);
  refreshItemSelect();
}

$(document).ready(function () {
  fetch("./documents/documents.json")
    .then((response) => response.json())
    .then((data) => {
      buildPapyrusSelector(data);
    });

  $("#showBackground").click(function () {
    let bg_img = $("#background");
    if (!$("#showBackground").is(":checked")) {
      bg_img.css("opacity", 0);
    } else {
      bg_img.css("opacity", 1);
    }
  });
});

function flipWhole() {
    var disableAnimation = 0;
    if ($("#enableAnimate").is(":checked")) {
        disableAnimation = 1
    }

  var checkbox = document.querySelector('#enableAnimate');
  checkbox.checked = false;

  if ($("#enableAnimate").is(":checked")) {
    $("#flipWholeButton").prop("disabled", true);
    setTimeout(function () {
      $("#flipWholeButton").prop("disabled", false);
    }, 600);
  }

  const imageContainer = document.getElementById("imageContainer");
  const images = imageContainer.querySelectorAll("img");
  const div = imageContainer;
  const bg_img = div.querySelector('img[src$="background.png"]');
  let width = 0;

  if (bg_img) {
    width = bg_img.naturalWidth;
  }

  images.forEach(function (image, i) {
    const rect = image.getBoundingClientRect();
    const imgTop = image.offsetTop;
    const imgLeft = image.offsetLeft;
    const src = image.getAttribute("src");
    const filename = src.split("/").pop();

    if (!(filename == "background.png")) {
      removeRotateHandle(); // Remove the rotate handle before flipping the image
      fragmentFlip.call(image);
      let center = imgLeft + rect.width / 2;

      let newCenter = width - center;
      let newLeft = newCenter - rect.width / 2;
      image.style.left = `${newLeft}px`;
    }
  });

  if(disableAnimation){
    checkbox.checked = true;
  }
}

function removeRotateHandle() {
  $(".rotate-handle").remove();
}

function lab2rgb(lab){
  var y = (lab[0] + 16) / 116,
    x = lab[1] / 500 + y,
    z = y - lab[2] / 200,
    r, g, b;

  x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16/116) / 7.787);
  y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16/116) / 7.787);
  z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16/116) / 7.787);

  r = x *  3.2406 + y * -1.5372 + z * -0.4986;
  g = x * -0.9689 + y *  1.8758 + z *  0.0415;
  b = x *  0.0557 + y * -0.2040 + z *  1.0570;

  r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1/2.4) - 0.055) : 12.92 * r;
  g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1/2.4) - 0.055) : 12.92 * g;
  b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1/2.4) - 0.055) : 12.92 * b;

  return [Math.max(0, Math.min(1, r)) * 255,
    Math.max(0, Math.min(1, g)) * 255,
    Math.max(0, Math.min(1, b)) * 255]
}


function rgb2lab(rgb){
  var r = rgb[0] / 255,
    g = rgb[1] / 255,
    b = rgb[2] / 255,
    x, y, z;

  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}


function enhanceVividness(imageData, negative) {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;

  let minVividness = 99999;
  let maxVividness = -99999;

  // First we find the bounds of the vividness
  for (let i = 0; i < data.length; i += 4) {
    // Extract RGB values
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Convert RGB to LAB
    let [L, A, B] = rgb2lab([r, g, b]);

    // Apply transformation to L component
    if (negative) {
      L = 100 - Math.sqrt(L * L + A * A + B * B);
    } else {
      L = Math.sqrt(L * L + A * A + B * B);
    }

    if (L > maxVividness) {
      maxVividness = L;
    }

    if (L < minVividness) {
      minVividness = L;
    }

  }

  // Loop over every pixel
  for (let i = 0; i < data.length; i += 4) {
    // Extract RGB values
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Convert RGB to LAB
    let [L, A, B] = rgb2lab([r, g, b]);

    // Apply transformation to L component
    if (negative) {
      L = 100 - Math.sqrt(L * L + A * A + B * B);
    } else {
      L = Math.sqrt(L * L + A * A + B * B);
    }

    // Scale to bounds
    L = ( (L - minVividness)/(maxVividness - minVividness) ) * 100;

    // Convert LAB back to RGB
    const [rOut, gOut, bOut] = lab2rgb([L, A, B]);

    // Set modified RGB values back onto the ImageData object
    data[i] = rOut;
    data[i + 1] = gOut;
    data[i + 2] = bOut;
  }

  // Create a new ImageData object from the modified pixel data and return it
  return new ImageData(data, width, height);
}

function blueShift(imageData) {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;

  // Loop over every pixel
  for (let i = 0; i < data.length; i += 4) {
    // Extract RGB values
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Convert RGB to LAB
    let [L, A, B] = rgb2lab([r, g, b]);

    A *= -1;
    B *= -1;

    // Convert LAB back to RGB
    const [rOut, gOut, bOut] = lab2rgb([L, A, B]);

    // Set modified RGB values back onto the ImageData object
    data[i] = rOut;
    data[i + 1] = gOut;
    data[i + 2] = bOut;
  }

  // Create a new ImageData object from the modified pixel data and return it
  return new ImageData(data, width, height);
}

function invert(imageData) {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];         // invert red
    data[i + 1] = 255 - data[i + 1]; // invert green
    data[i + 2] = 255 - data[i + 2]; // invert blue
  }

  return imageData;
}

function retinex(imageData, sigma, gain, offset) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const size = width * height;

  const R = new Float32Array(size);
  const G = new Float32Array(size);
  const B = new Float32Array(size);
  const L = new Float32Array(size);

  // Convert the input RGB values to float values
  for (let i = 0; i < size; i++) {
    R[i] = data[i * 4] / 255;
    G[i] = data[i * 4 + 1] / 255;
    B[i] = data[i * 4 + 2] / 255;
  }

  // Calculate the logarithm of the input RGB values
  for (let i = 0; i < size; i++) {
    L[i] = Math.log10(R[i] + G[i] + B[i]);
  }

  // Apply the Retinex algorithm
  const blurred = new Float32Array(size);
  const output = new Float32Array(size);
  const kernelSize = Math.ceil(sigma * 3) * 2 + 1;
  const kernel = new Float32Array(kernelSize);

  for (let i = 0; i < kernelSize; i++) {
    const x = i - Math.floor(kernelSize / 2);
    kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let weight = 0;

      for (let j = 0; j < kernelSize; j++) {
        const x2 = x + j - Math.floor(kernelSize / 2);
        if (x2 < 0 || x2 >= width) {
          continue;
        }

        const index = y * width + x2;
        // const distance = j - Math.floor(kernelSize / 2);
        const w = kernel[j];

        sum += w * L[index];
        weight += w;
      }

      blurred[y * width + x] = sum / weight;
    }
  }

  for (let i = 0; i < size; i++) {
    output[i] = gain * (L[i] - blurred[i]) + offset;
  }

  // Convert the output values back to RGB values
  for (let i = 0; i < size; i++) {
    const value = Math.pow(10, output[i]);
    data[i * 4] = Math.min(Math.max(Math.round(value * R[i] * 255), 0), 255);
    data[i * 4 + 1] = Math.min(Math.max(Math.round(value * G[i] * 255), 0), 255);
    data[i * 4 + 2] = Math.min(Math.max(Math.round(value * B[i] * 255), 0), 255);
  }

  return new ImageData(data, width, height);
}


function closeOverlay() {
  $(".enhanceOverlay").remove();
  $(".enhanceCloseButton").remove();
}

function enhance() {
  console.log("Enhancing...");
  $("#enhanceSelector").parent().append(`<div class="loader"></div>`)
  $("#enhanceButton").toggle();
  $("#imageContainer").css("height", $("#background").height());
  html2canvas($("#imageContainer").get(0)).then( function(orig) {
    let ctx = orig.getContext("2d");
    const origData = ctx.getImageData(0, 0, orig.width, orig.height);

    let newData, choice = $("#enhanceSelector").children("option:selected").val();

    if (choice === "negative") {
      newData = invert(origData);
    } else if (choice == "vividness") {
      newData = enhanceVividness(origData, false);
    } else if (choice == "neg_vividness") {
      newData = enhanceVividness(origData, true);
    } else if (choice == "blue") {
      newData = blueShift(origData);
    } else if (choice == "vivid_blue") {
      newData = enhanceVividness(origData, false);
      newData = blueShift(newData);
    } else if (choice == "neg_vivid_blue") {
      newData = enhanceVividness(origData, true);
      newData = blueShift(newData);
    } else if (choice == "retinex") {
      newData = retinex(origData, 15, 2, 0);
    } else if (choice == "neg_retinex") {
      newData = retinex(origData, 15, 2, 0);
      newData = enhanceVividness(newData, true);
    } else if (choice == "retinex_blue") {
      newData = retinex(origData, 15, 2, 0);
      newData = blueShift(newData);
    } else if (choice == "neg_retinex_blue") {
      newData = retinex(origData, 15, 2, 0);
      newData = enhanceVividness(newData, true);
      newData = blueShift(newData);
    }

    ctx.putImageData(newData, 0, 0);

    // let t = $("#background").offset().top;
    // let l = $("#background").offset().left;
    let w = $("#background").width();
    let h = $("#background").height();

    let overlay = $(`<div class="enhanceOverlay" style="width:${w}; height:${h}; position:absolute; z-index:900;"><img src="${orig.toDataURL()}" style="width:100%;height:100%;" draggable="false"/></div>`);
    $("#imageContainer").append(overlay);
    $("#imageContainer").append(`<div class="enhanceCloseButton" style="position:absolute; top:0px; right:0px; z-index:901" onclick="closeOverlay()">⨂</div>`);


    $("#enhanceButton").toggle();
    $(".loader").remove();
  });
}

$(document).ready(function() {
  $('#toggleButton').click(function() {
    if ($('body').css('cursor') === 'zoom-in') {
      $('body').css('cursor', '');
      $(this).removeClass('active');
      $(".enhanceOverlay").trigger("zoom.destroy");
    } else {
      $('body').css('cursor', 'zoom-in');
      $(this).addClass('active');
      $(".enhanceOverlay").zoom({ magnify: 3 });
    }
  });
  $("#enhanceButton").on("click", enhance);
});
