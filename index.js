var net = require('net');
var through = require('through');

module.exports = function (cb) {
    var server = net.createServer(function (stream) {
        var src = through();
        src.pause();
        stream.pipe(src);
        
        var bounce = function (dst) {
            src.pipe(dst).pipe(stream);
            src.resume();
        };
        cb({}, bounce);
    });
    return server;
};
