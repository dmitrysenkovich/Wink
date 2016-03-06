var express = require('express');
var cors = require('cors');
var Caman = require('caman').Caman;
var fs = require('fs');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())


var BUFFER_PATH =  "../temp/buffer.";


/*
    TODO:
    1) fix large entity fail,
    2) fix failing many times
*/
app.post('/filterImage', function(req, res) {
    var image = req.body.image;
    var filterName = req.body.filterName;

    type = "";
    base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
    if (base64Data.length < image.length)
        type = "jpg";
    else
        type = "png";
    var base64Data = base64Data.replace(/^data:image\/png;base64,/, "");

    fs.writeFile(BUFFER_PATH + type, base64Data, 'base64', function(err) {
        if (err)
            console.log('Error writing: ' + err);
    });

    Caman(BUFFER_PATH + type, function () {
        this.revert();
        this[filterName]();
        this.render();
        res.json({ filteredImage : this.canvas.toDataURL("image/" + type) });
    });
});


app.listen(8080);
