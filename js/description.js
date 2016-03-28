var imageLoading = false;
var imageProcessing = false;

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
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
    if (imageLoading || imageProcessing)
        return;
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

function getImageDescription() {
    if (!pictureLoaded() || imageLoading || imageProcessing)
        return;
    $("#original-image-loading-cover-span").animate({opacity: '1'}, 500);
    imageProcessing = true;
    $.ajax({
        url: "http://localhost:8080/getImageDescription",
        type: "POST",
        data: JSON.stringify({ image : img.src }),
        processData: false,
        contentType: 'application/json',

        beforeSend: function (request) {
            request.setRequestHeader("Access-Control-Allow-Origin", "http://localhost:8080");
        },

        success: function (res) {
            console.log('ok');
            var result = res.result;
            document.getElementById("tags-textarea").value = result;
            $("#original-image-loading-cover-span").animate({opacity: '0'}, 500);
            imageProcessing = false;
        },

        error: function(err) {
            if (err)
                console.log("Error receiving tags: " + err);
            $("#original-image-loading-cover-span").animate({opacity: '0'}, 500);
            imageProcessing = false;
        }
    });
}

function getFaceDescription() {
    if (!pictureLoaded() || imageLoading || imageProcessing)
        return;
    $("#original-image-loading-cover-span").animate({opacity: '1'}, 500);
    imageProcessing = true;
    $.ajax({
        url: "http://localhost:8080/getFaceDescription",
        type: "POST",
        data: JSON.stringify({ image : img.src }),
        processData: false,
        contentType: 'application/json',

        beforeSend: function (request) {
            request.setRequestHeader("Access-Control-Allow-Origin", "http://localhost:8080");
        },

        success: function (res) {
            console.log('ok');
            var result = res.result;
            document.getElementById("tags-textarea").value = result;
            $("#original-image-loading-cover-span").animate({opacity: '0'}, 500);
            imageProcessing = false;
        },

        error: function(err) {
            if (err)
                console.log("Error receiving tags: " + err);
            $("#original-image-loading-cover-span").animate({opacity: '0'}, 500);
            imageProcessing = false;
        }
    });
}
