#!/usr/bin/env node
var configFile = process.argv[2];
var port = parseInt(process.argv[3], 10);
var fs = require('fs');

if (!configFile || !port) {
    fs.createReadStream(__dirname + '/usage.txt')
        .pipe(process.stdout)
        .on('end', process.exit.bind(null, 1))
    ;
    return;
}

var config = JSON.parse(fs.readFileSync(configFile));

var bouncy = require('../');
var server = bouncy(function (req, res, bounce) {
    var host = (req.headers.host || '').replace(/:\d+$/, '');
    var route = config[host] || config[''];
    
    if (Array.isArray(route)) {
        // jump to a random route on arrays
        route = route[Math.floor(Math.random() * route.length)];
    }
    
    req.on('error', onerror);
    function onerror (err) {
        res.statusCode = 500;
        res.setHeader('content-type', 'text/plain');
        res.end(String(err) + '\r\n');
    }
    
    if (typeof route === 'string') {
        var s = route.split(':');
        var b = s[1]
            ? bounce(s[0], s[1])
            : bounce(s)
        ;
        b.on('error', onerror);
    }
    else if (route) {
        bounce(route).on('error', onerror);
    }
    else {
        res.statusCode = 404;
        res.setHeader('content-type', 'text/plain');
        res.write('host not found\r\n');
        res.end();
    }
});
server.listen(port);
