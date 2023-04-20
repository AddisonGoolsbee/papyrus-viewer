
// python3 -m http.server 8000

function fragmentFlip() {
    let width = $(this).get(0).clientWidth;
    //console.log(this)
    let newSrc = "";

    let duration = $("#enableAnimate").is(":checked") ? 300 : 0;

    if ($(this).attr("src").includes("front.png")) {
        newSrc = $(this).attr("src").replace("front.png", "back.png");
    } else {
        newSrc = $(this).attr("src").replace("back.png", "front.png");
    }
    $(this).animate({width: '0px', marginLeft: `${width/2}px`}, duration, 'swing', function() {
        $(this).attr("src", newSrc);
        $(this).animate({width: width, marginLeft: `0px`}, duration, 'swing',);
    });
}

function loadFragmentImages(fragments, path){
    $("#imageContainer img").remove();

    let bg_img = $("<img class='background'></img>");
    $("#imageContainer").append(bg_img);
    bg_img.attr("src", `${path}/fragments/background.png`)

    for (f in fragments) {
        let f_img = $("<img></img>");
        $("#imageContainer").append(f_img);

        f_img.css("left", fragments[f].split(",")[0] + "px");
        f_img.css("top", fragments[f].split(",")[1] + "px");

        f_img.on('load', function(){
            $(this).css('width', $(this).get(0).naturalWidth);
            $(this).css('height', $(this).get(0).naturalHeight);
        });
        f_img.attr("src", `${path}/fragments/${f}_front.png`);
    }

    $("#imageContainer img").each(function() {
        if(this.complete) {
            $(this).trigger('load');
        }
    });

    $("#imageContainer img").dblclick(fragmentFlip);
    //console.log('yes container')


    $("#imageContainer img").draggable( {
                                        containment:  'img[src$="background.png"]',

                                        start: function (){

                                            $(this).css("border", "2px dashed red");
                                        },
                                        stop: function (){
                                            $(this).css("border", "none");
                                        } });
    $("#imageContainer img").click(selectImage);
    
    zindex = 0
    let ctx = document.createElement("canvas").getContext("2d");
    $("#imageContainer img").on("mousedown", function(event) {
        let x = event.pageX;
        let y = event.pageY;
        let w = $(this).prop("naturalWidth");
        let h = $(this).prop("naturalHeight");
        ctx.canvas.width = w;
        ctx.canvas.height = h;

        let offset = $(this).offset();
  
        image = new Image()
        image.src = $(this).attr("src")
        ctx.drawImage(image, 0, 0, w, h);
      
        alpha = ctx.getImageData(Math.floor(x - offset.left), Math.floor(y - offset.top), 1, 1).data[3]; // [0]R [1]G [2]B [3]A

        if(alpha===0) {
            this.style.pointerEvents = "none";
            $(document.elementFromPoint(event.clientX, event.clientY)).trigger("click");
            this.style.pointerEvents = "auto";
        }
        
    });
}

function selectImage() {
    $(this).css("z-index", zindex + 1);
    zindex = zindex + 1;
    // Remove border and selected class from other images
    $("#imageContainer img").css("border", "none").removeClass("selected");
  
    // Add border and selected class to selected image
    $(this).css("border", "2px dashed red").addClass("selected");
  
    // Remove rotate handle from previously selected image
    $(".rotate-handle").remove();
  
    // Add rotate handle to the border of selected image
    let handle = $("<div class='rotate-handle'></div>");
    handle.appendTo($(this).parent());
    let handleSize = handle.outerWidth(true);
  
    handle.css({
      left: ($(this).position().left + $(this).outerWidth() / 2 - handleSize / 2) + "px",
      top: ($(this).position().top - handleSize / 2) + "px",
      "background-image":
        "url(papyrus-viewer/rotate-icon.png)", // Replace with the path to your rotate icon image
    });
  
    // Make the rotate handle rotatable by the mouse
    let selectedImg = $(".selected");
    let startX, startY, startAngle;
  
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
  
    function rotateImage(e) {
        e.preventDefault();
        let mouseX = e.pageX;
        let mouseY = e.pageY;
      
        let centerX =
          selectedImg.offset().left + selectedImg.width() / 2 - $(window).scrollLeft();
        let centerY =
          selectedImg.offset().top + selectedImg.height() / 2 - $(window).scrollTop();
      
        let radians = Math.atan2(mouseX - centerX, mouseY - centerY);
        let degrees = -(radians * (180 / Math.PI)) + 90 + startAngle;
      
        selectedImg.css("transform", "rotate(" + degrees + "deg)").data("rotation", degrees);
        
      }   
  }
  

function loadItem() {
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
        $("#itemSelector").append(`<option value=${i}> Item #${i}</option>`)
    }
    $("#itemSelector").on("change", loadItem)
    loadItem();
}

function buildPapyrusSelector(item_counts) {
    $("#documentSelector option").remove();
    for (p in item_counts) {
        $("#documentSelector").append(`<option value=${p}>${p} (${item_counts[p]} item${item_counts[p]>1 ? 's': ''})</option>`)
    }
    buildItemSelector(item_counts);
    function refreshItemSelect() {
        buildItemSelector(item_counts)
    }
    $("#documentSelector").on("change", refreshItemSelect)
    refreshItemSelect();
}

$(document).ready(function () {
    fetch('./documents/documents.json')
        .then((response) => response.json())
        .then((data) => {
            buildPapyrusSelector(data);
        });

});

function flipWhole(){
	
const imageContainer = document.getElementById('imageContainer');


const images = imageContainer.querySelectorAll('img');

const div = imageContainer;
const image = div.querySelector('img[src$="background.png"]');
let width = 0

if (image) {
  //console.log(`Image found: ${image.getAttribute('src')}`);
  //console.log(`Image dimensions: ${image.naturalWidth} x ${image.naturalHeight}`);
  width = image.naturalWidth;
} else {
  //console.log('Image not found');
}
images.forEach(function(image, i) {
  
  //console.log(image)
  fragmentFlip.call(image);
  const rect = image.getBoundingClientRect();
  const src = image.getAttribute('src');
  const filename = src.split('/').pop();
  //console.log(`Image ${i + 1} filename: ${filename}`);
  //console.log(`Image ${i + 1}: x=${rect.left}, y=${rect.top}, width=${rect.width}, height=${rect.height}`);
  if(!(filename == "background.png")){
  	//console.log(filename + "------------------------------------")
  	let cent = rect.left + rect.width/2
  	let newcent = width - cent
  	let newLoc = newcent - rect.width/2 - 200
  	image.style.left = `${newLoc}px`;
  	
  }
  
});


	//console.log("flip whole");
}