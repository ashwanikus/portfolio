/**
 * Created by Ashwani on 05-09-2017.
 */
var express = require('express');
var compression = require('compression');
var app = express();
var bodyParser = require('body-parser');
var helmet = require('helmet');

var http = require('http');
var morgan = require('morgan');
var querystring = require('querystring');
var https = require('https');

var send = require('send');

app.use(helmet());
app.use(helmet.frameguard({action: 'sameorigin'}));
app.use(helmet.dnsPrefetchControl());
app.use(helmet.hidePoweredBy());

app.use(compression());


// Sets "Strict-Transport-Security: max-age=5184000; includeSubDomains".
var sixtyDaysInSeconds = 31536000;
app.use(helmet.hsts({
    maxAge: sixtyDaysInSeconds
}));
app.use(helmet.ieNoOpen());

var mcache = require('memory-cache');

var cache = function (duration) {
    return function (req, res, next) {
        var key = '__express__' + req.originalUrl || req.url;        
        var cachedBody = mcache.get(key);
        if (cachedBody) {            
            res.send(cachedBody);
            return;
        } else {
            res.sendResponse = res.send;
            res.send = function (body) {
                mcache.put(key, body, duration * 1000);
                res.sendResponse(body);
            }
            next();
        }
    }
}


/**
 * End File require for inner routing
 */
app.use('/', cache(10), function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, token, Accept');
    req.url = req.url.replace(/\/([^\/]+)\.[0-9a-f]+\.(css|js|jpg|png|gif|svg)$/, '/$1.$2');
    next();
});

var port = process.env.PORT || 3000;
http.Server(app).listen(port, function () {
    console.log("\nServer connected. Listening on port: ", port);
});



/**
 * End Constant Through Out the routing
 */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(express.static(__dirname + '/app'));

app.get('*', function (req, res) {
    res.end("Stay away!");    
});
