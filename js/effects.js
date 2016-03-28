var imageLoading = false;
var imageFiltering = false;

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var originalCanvas = document.createElement("CANVAS");
var originalCtx = originalCanvas.getContext("2d");
var img = new Image();
img.onload = start;
img.src = "images/empty.png";
function start() {
    var ratio = 1;
    if (img.height > canvas.height || img.width > canvas.width) {
        var hRatio = canvas.width / img.width;
        var vRatio = canvas.height / img.height;
        ratio = Math.min(hRatio, vRatio);
    }
    var centerShift_x = (canvas.width - img.width*ratio) / 2;
    var centerShift_y = (canvas.height - img.height*ratio) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0,0, img.width, img.height,
              centerShift_x,centerShift_y,img.width*ratio, img.height*ratio);
    originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
    originalCanvas.width = img.width;
    originalCanvas.height = img.height;
    originalCtx.drawImage(img, 0, 0);
}

var dropbox = document.getElementById('image-wrapper');
dropbox.addEventListener('dragenter', noopHandler, false);
dropbox.addEventListener('dragexit', noopHandler, false);
dropbox.addEventListener('dragover', noopHandler, false);
dropbox.addEventListener('drop', drop, false);

function noopHandler(evt) {
    evt.stopPropagation();
    evt.preventDefault();
}

function drop(evt) {
    imageLoading = true;
    evt.stopPropagation();
    evt.preventDefault();
    var image = evt.dataTransfer.files[0];
    var reader = new FileReader();
    $("#original-image-loading-cover-span").animate({opacity: '1'}, 500);
    reader.onload = (function(image) {
        return function(e) {
            img.src = e.target.result;
            $("#original-image-loading-cover-span").animate({opacity: '0'}, 500);
            imageLoading = false;
        };
    })(image);
    reader.readAsDataURL(image);
}

function pictureLoaded() {
    var filepathOfFileInOriginalImageTag = img.src;
    if (typeof filepathOfFileInOriginalImageTag != 'undefined') {
        var filenameOfFileInOriginalImageTag = getFilename(filepathOfFileInOriginalImageTag);
        if (filenameOfFileInOriginalImageTag == 'empty.png') {
            return false;
        }
    }
    return true;
}

function getFilename(filepath) {
    return filepath.split('\\').pop().split('/').pop();
}

var filterCovers = document.getElementsByClassName('filter-cover');
for (var i = 0; i < filterCovers.length; i++) {
    var filterCover = $('#' + filterCovers[i].id);
    filterCover.on('click', function(e) {
        if (!pictureLoaded() || imageLoading || imageFiltering)
            return;
        imageFiltering = true;
        $("#original-image-loading-cover-span").animate({opacity: '1'}, 500);
        return function(filterCoverId) {
            $.ajax({
                url: "http://localhost:8080/filterImage",
                type: "POST",
                data: JSON.stringify({ image : img.src,
                                       filterName : filterCoverId }),
                processData: false,
                contentType: 'application/json',

                beforeSend: function (request) {
                    request.setRequestHeader("Access-Control-Allow-Origin", "http://localhost:8080");
                },

                success: function (res) {
                    console.log('ok');
                    img.src = res.filteredImage;
                    start();
                    $("#original-image-loading-cover-span").animate({opacity: '0'}, 500);
                    imageFiltering = false;
                },

                error: function(err) {
                    if (err)
                        console.log("Error receiving filtered image: " + err);
                    $("#original-image-loading-cover-span").animate({opacity: '0'}, 500);
                    imageFiltering = false;
                }
            });
        }(e.target.id == '' ? e.target.parentElement.id : e.target.id);
    });
}

$("#image-wrapper").hover(function() {
    if (!pictureLoaded() || imageLoading || imageFiltering)
            return;
    $("#original-image-cover-span").animate({opacity: '1'}, 500);
}, function() {
    if (!pictureLoaded())
            return;
    $("#original-image-cover-span").animate({opacity: '0'}, 500);
});

function saveFilteredImage() {
    originalCanvas.toBlob(function(blob) {
        saveAs(blob, "filtered.png");
    }, 'image/png');
}
