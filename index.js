var http = require('http');
var through = require('through');
var parseArgs = require('./lib/parse_args.js');

module.exports = function (cb) {
    var server = http.createServer();
    server.on('connection', function (stream) {
        var src = stream._bouncyStream = through();
        src.pause();
        stream.pipe(src);
    });
    
    server.on('request', function (req, res) {
        var src = req.connection._bouncyStream;
        var bounce = function (dst) {
            if (!dst || typeof dst.pipe !== 'function') {
                dst = parseArgs(arguments);
            }
            
            function destroy () {
                src.destroy();
                dst.destroy();
            }
            src.on('error', destroy);
            dst.on('error', destroy);
            
            src.pipe(dst).pipe(req.connection);
            src.resume();
        };
        
        if (cb.length === 2) cb(req, bounce)
        else cb(req, res, bounce)
    });
    return server;
};
