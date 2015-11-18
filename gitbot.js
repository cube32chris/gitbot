var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var irc = require("irc");
var fs = require("fs");

var config = require("./data/config.json");

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data

// Create the bot
var bot = new irc.Client(config.server, config.botName, {
    channels: config.channels
});

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/favicon.ico', function (req, res) {
    res.sendFile('favicon.ico', { root: __dirname + '/public/' });
});

app.get('/map', function (req, res) {
    res.sendFile('map.htm', { root: __dirname + '/public/' });
});

app.get('/map/ping', function (req, res) {
    res.sendFile('ping.json', { root: __dirname + '/data/' });
});

app.post('/ping/msg/', function (req, res) {
    res.send('POST request to the /ping/msg/');
    bot.say(config.channels[0], req.body.message);
});

app.post('/ping/loc/', function (req, res) {
    res.send('200 Information Accepted');
    var now = new Date();
    var ping = {
        device: req.body.pinginfo.split(',')[5],
        lat: req.body.pinginfo.split(',')[0],
        lng: req.body.pinginfo.split(',')[1],
        alt: req.body.pinginfo.split(',')[2],
        spd: req.body.pinginfo.split(',')[3],
        batt: req.body.pinginfo.split(',')[4],
        at: now.toJSON()
    }
    fs.writeFile("./data/ping.json", JSON.stringify(ping), "utf8");
});

var server = app.listen(32768, function () {
    var port = server.address().port;
    console.log('Example app listening on port [%s]', port);
});
    
bot.addListener('message', function(from, to, message) {
    if(  message.indexOf('.+chan') > -1)
    {
        var obj = config;
        obj['channels'].push(message.split(' ')[1]);
        fs.writeFile("./data/config.json", JSON.stringify(obj), "utf8");
        bot.say(to, "channel added to config.");
    }
});