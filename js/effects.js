var imageLoading = false;
var imageFiltering = false;

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
            var originalImage = document.getElementById('original-image');
            originalImage.src = e.target.result;
            $("#original-image-loading-cover-span").animate({opacity: '0'}, 500);
            imageLoading = false;
        };
    })(image);
    reader.readAsDataURL(image);
}

function pictureLoaded() {
    var filepathOfFileInOriginalImageTag = document.getElementById('original-image').src;
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
                data: JSON.stringify({ image : document.getElementById('original-image').src,
                                       filterName : filterCoverId }),
                processData: false,
                contentType: 'application/json',

                beforeSend: function (request) {
                    request.setRequestHeader("Access-Control-Allow-Origin", "http://localhost:8080");
                },

                success: function (res) {
                    console.log('ok');
                    document.getElementById('original-image').src = res.filteredImage;
                    $("#original-image-loading-cover-span").animate({opacity: '0'}, 500);
                    imageFiltering = false;
                },

                error: function(err) {
                    if (err)
                        console.log("Error receiving filtered image: " + err);
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
    Caman('#original-image', function () {
        this.render(function () {
            var saveLink = this.save('png');
            saveLink.download = 'filtered.png';
            saveLink.click();
        });
    });
}
