importScripts('caman.full.min.js');

self.addEventListener("message", function(e) {
    var filterName = e.data['filterName'];
    var image = e.data['image'];
    Caman(image, function() {
        this.revert();
        this[filterName]();
        this.render();
        console.log('rendered');
        var dataToTransfer = { 'image' : image };
        postMessage(dataToTransfer);
    });
}, false);
