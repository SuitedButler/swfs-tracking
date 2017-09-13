var request = require('request');
var async = require('async');
var fs = require('fs-extra');
var http = require('http');

var partyApi = 'http://api.oasis.ps/service/party';
var iParty = 'https://api.oasis.ps/service/party/';
var pRoom = 'https://cdn.penguinoasis.net/play/v2/content/global/rooms/';

request(partyApi, function(error, response, body) {
    if (!response || response.statusCode != 200) {
        return console.log('Error retreiving');
    }

    console.log(JSON.stringify(JSON.parse(body), null, 2));
    var parties = JSON.parse(body);
    async.eachSeries(parties, function(p, callback) {
        var dir = './swfs/' + p.year + '/' + p.party_label.replace(':', '') + '/';
        fs.ensureDirSync(dir);
        console.log(dir);

        request(iParty + p.party_id, function(error, response, body) {
            if (!response || response.statusCode != 200) {
                console.log('Error retreiving');
                return callback();
            }

            var b = JSON.parse(body).room;
            async.forEachOfSeries(b, function(value, key, callback) {
                console.log('Downloading: ' + dir + key + '.swf');
                download(pRoom + value, dir + key + '.swf', callback);
            }, function(err) {
                return callback();
            });
        });
    }, function(err) {
        console.log('All done');
    });
});


var download = function(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var sendReq = request.get(url);

    // verify response code
    sendReq.on('response', function(response) {
        if (response.statusCode !== 200) {
            return cb('Response status was ' + response.statusCode);
        }
    });

    // check for request errors
    sendReq.on('error', function(err) {
        fs.unlink(dest);
        return cb(err.message);
    });

    sendReq.pipe(file);

    file.on('finish', function() {
        file.close(cb); // close() is async, call cb after close completes.
    });

    file.on('error', function(err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        return cb(err.message);
    });
};
