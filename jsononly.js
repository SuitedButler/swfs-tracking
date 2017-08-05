var request = require('request');
var async = require('async');
var fs = require('fs-extra');
var http = require('http');

var partyApi = 'http://api.oasis.ps/service/party';
var iParty = 'https://api.oasis.ps/service/party/';
var pRoom = 'https://cdn.penguinoasis.net/play/v2/content/global/rooms/';

request(partyApi, function (error, response, body) {
    if (!response || response.statusCode != 200) {
        return console.log('Error retreiving');
    }

    fs.ensureDirSync('./json');
    fs.writeFileSync('./json/0-main.json', JSON.stringify(JSON.parse(body), null, 2));
    var parties = JSON.parse(body);
    async.eachSeries(parties, function (p, callback) {
        var dir = './json/' + p.party_label.replace(':', '') + '.json';
        request(iParty + p.party_id, function (error, response, body) {
            if (!response || response.statusCode != 200) {
                console.log('Error retreiving');
                return callback();
            }
            
            console.log('Downloading: ' + p.party_label.replace(':', ''));
            fs.writeFileSync(dir, JSON.stringify(JSON.parse(body), null, 2));
            return callback();
        });
    }, function (err) {
        console.log('All done');
    });
});