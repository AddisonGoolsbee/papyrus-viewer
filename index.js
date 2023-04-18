function fragmentFlip() {
    let width = $(this).get(0).clientWidth;
    console.log(this)
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
    $("#imageContainer img").draggable( {
                                        start: function (){
                                            $(this).css("border", "2px dashed red");
                                        },
                                        stop: function (){
                                            $(this).css("border", "none");
                                        } });
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


images.forEach(function(image) {
  
  console.log(image)
  fragmentFlip.call(image);

});

	console.log("flip whole");
}



// let angle = 0;
// $("#tiltButton").click(function () {
//     angle += 15;
//     $("#frontImage").css("transform", "rotate(" + angle + "deg)");
//     $("#backImage").css("transform", "scaleX(-1) rotate(-" + angle + "deg)");
// });
//
