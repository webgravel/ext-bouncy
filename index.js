var http = require('http');
var through = require('through');

module.exports = function (cb) {
    var server = http.createServer();
    server.on('connection', function (stream) {
        var src = stream._bouncySource = through();
        src.pause();
        stream.pipe(src);
    });
    
    server.on('request', function (req, res) {
        var src = req.connection._bouncySource;
        var bounce = function (dst) {
            src.pipe(dst).pipe(req.connection);
            src.resume();
        };
        
        if (cb.length === 2) cb(req, bounce)
        else cb(req, res, bounce)
    });
    return server;
};
