var express = require('express');
var cors = require('cors');
var fs = require('fs');
var unirest = require('unirest');
var request = require('request');

var bodyParser = require('body-parser');
var app = express();


app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true , limit: '50mb'}));
app.use(cors())


var Caman = require('caman').Caman;
var cloudinary = require('cloudinary');


cloudinary.config({
    cloud_name: 'dmitrysenkovichcloud',
    api_key: '854172347199542',
    api_secret: '8a9pDMfgoDen2QedOJjj-AYCQoQ'
});


var BUFFER_PATH =  '../temp/buffer.';
var IMAGGA_URL = 'https://api.imagga.com/v1/categorizations/personal_photos?url=';
var IMAGGA_API_KEY = 'acc_9ec61834fba6210';
var IMAGGA_API_SECRET = 'ae821bdf3bba0043a90ec38edcf8e174';


var ORIGINAL_FILENAME = 'ORIGINAL_FILENAME';
var INTERESTING_TAGS = ['age', 'beard', 'expression', 'gender', 'glasses', 'race',
                        'chin size', 'color eyes', 'color hair', 'teeth visible'];


app.post('/filterImage', function(req, res) {
    var image = req.body.image;
    var filterName = req.body.filterName;

    type = saveTempImage(image);

    Caman(BUFFER_PATH + type, function () {
        this.revert();
        this[filterName]();
        this.render();
        res.json({ filteredImage : this.canvas.toDataURL("image/" + type) });
    });
});


app.post('/getImageDescription', function(req, res) {
    var image = req.body.image;
    type = saveTempImage(image);
    cloudinary.uploader.upload(BUFFER_PATH + type, function(result, error) {
        if (error)
            console.log('Error trying to upload image to cloudinary: ' + error);
        var url = result.url;
        //var url = 'http://res.cloudinary.com/dmitrysenkovichcloud/image/upload/v1458309338/qqmf1t159cmj2ltj0in6.jpg';
        request.get(IMAGGA_URL + encodeURIComponent(url), function (error, response, body) {
            if (error)
                console.log('Error trying to retrieve tags from image: ' + error);
            var tags = JSON.parse(body).results[0].categories;
            var result = '';
            var tagsCount = tags.length;
            for (var i = 0; i < tagsCount; i++) {
                var tag = tags[i];
                result += tag.name + ': ' + tag.confidence + '%';
                if (i != tagsCount - 1)
                    result += '\n';
            }
            res.json({ 'result' : result });
        }).auth(IMAGGA_API_KEY, IMAGGA_API_SECRET, true);
    });
});


app.post('/getFaceDescription', function(req, res) {
    var image = req.body.image;
    type = saveTempImage(image);
    cloudinary.uploader.upload(BUFFER_PATH + type, function(result, error) {
        if (error)
            console.log('Error trying to upload image to cloudinary: ' + error);
        var url = result.url;
        //var url = 'http://res.cloudinary.com/dmitrysenkovichcloud/image/upload/v1459148819/kkx9xdkvbpe1dutebscf.jpg';
        var data = {
            'api_key' : 'd45fd466-51e2-4701-8da8-04351c872236',
            'api_secret' : '171e8465-f548-401d-b63b-caf0dc28df5f',
            'detection_flags' : 'bestface, classifiers, extended',
            'image_url' : url,
            'original_filename' : ORIGINAL_FILENAME
        };
        request({
            url: 'http://betafaceapi.com/service_json.svc/UploadNewImage_Url',
            method: 'POST',
            headers: {
                'content-type' : 'application/json',
            },
            body: JSON.stringify(data)
        }, function(error, response, body) {
            if (error)
                console.log('Error trying to upload image with face: ' + error);
            var result = JSON.parse(response.body);
            var img_uid = result.img_uid;
            var data = {
                'api_key' : 'd45fd466-51e2-4701-8da8-04351c872236',
                'api_secret' : '171e8465-f548-401d-b63b-caf0dc28df5f',
                'img_uid' : img_uid
            };
            request({
                url: 'http://betafaceapi.com/service_json.svc/GetImageInfo',
                method: 'POST',
                headers: {
                    'content-type' : 'application/json',
                },
                body: JSON.stringify(data)
            }, function(error, response, body) {
                if (error)
                    console.log('Error trying to get face description info: ' + error);
                var result = JSON.parse(response.body);
                if (result.faces.length == 0)
                    res.json({ 'result' : 'No face detected on picture' });
                else {
                    var tags = result.faces[0].tags;
                    var tagsCount = tags.length;
                    var result = '';
                    for (var i = 0; i < tagsCount; i++) {
                        var tag = tags[i];
                        if (INTERESTING_TAGS.indexOf(tag.name) > -1) {
                            result += tag.name + ': ' +
                                tag.value + ', ' +
                                tag.confidence*100 + '%';
                            if (i != tagsCount - 1)
                                result += '\n';
                        }
                    }
                    res.json({ 'result' : result });
                }
            });
        });
    });
});


function saveTempImage(image) {
    type = "";
    base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
    if (base64Data.length < image.length)
        type = "jpg";
    else
        type = "png";
    var base64Data = base64Data.replace(/^data:image\/png;base64,/, "");

    fs.writeFileSync(BUFFER_PATH + type, base64Data, 'base64', function(error) {
        if (error)
            console.log('Error writing: ' + error);
    });

    return type;
}


/*function uploadTempImage(type) {
    cloudinary.uploader.upload(BUFFER_PATH + type, function(result, error) {
        if (error)
            console.log('Error trying to upload image to cloudinary: ' + error);
        console.log(result.url);
        return result.url;
    });
}


function getImageDescription(url) {
    request.get(IMAGGA_URL + encodeURIComponent(url), function (error, response, body) {
        if (error)
            console.log('Error trying to retrieve tags from image: ' + error);
        var tags = JSON.parse(body);
        console.log(tags.results[0].categories);
        return tags.results[0].categories;
    }).auth(API_KEY, API_SECRET, true);
}*/


app.listen(8080);
