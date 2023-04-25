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
  var filename = filename_full.split('_')[0]
  var side = filename_full.split('_')[1]
  paragraph.innerHTML = "text of " + side + " side of " + filename + ' is: Unknown';
  //console.log('new')

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

