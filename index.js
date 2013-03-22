var http = require('http');
var https = require('https');
var through = require('through');
var parseArgs = require('./lib/parse_args.js');
var insert = require('./lib/insert');
var nextTick = typeof setImmediate !== 'undefined'
    ? setImmediate
    : process.nextTick
;

module.exports = function (opts, cb) {
    if (typeof opts === 'function') {
        cb = opts;
        opts = {};
    }
    if (!opts) opts = {};
    if (typeof opts === 'object' && opts.listen) opts = { server: opts };
    
    var ssl = Boolean(opts.key && opts.cert);
    var connectionEvent = ssl ? 'secureConnection' : 'connection';
    
    var server = opts.server || (ssl
        ? https.createServer(opts)
        : http.createServer()
    );
    server.on(connectionEvent, function (stream) {
        var src = stream._bouncyStream = stealthBuffer();
        stream.pipe(src);
    });
    
    server.on('upgrade', onrequest);
    server.on('request', onrequest);
    return server;
    
    function onrequest (req, res) {
        var src = req.connection._bouncyStream;
        if (src._handled) return;
        src._handled = true;
        
        var bounce = function (dst) {
            var args = {};
            if (!dst || typeof dst.pipe !== 'function') {
                args = parseArgs(arguments);
                dst = args.stream;
            }
            if (!dst) dst = through();
            
            function destroy () {
                src.destroy();
                dst.destroy();
            }
            src.on('error', destroy);
            dst.on('error', destroy);
            
            var s = args.headers || args.method || args.path
                ? src.pipe(insert(args))
                : src
            ;
            s.pipe(dst).pipe(req.connection);
            
            nextTick(function () { src._resume() });
            return dst;
        };
        
        if (cb.length === 2) cb(req, bounce)
        else cb(req, res, bounce)
    }
};

function stealthBuffer () {
    // the raw_ok test doesn't pass without this shim
    // instead of just using through() and then immediately calling .pause()
    
    var tr = through(write, end);
    var buffer = [];
    tr._resume = function () {
        buffer.forEach(tr.queue.bind(tr));
        buffer = undefined;
    };
    return tr;
    
    function write (buf) {
        if (buffer) buffer.push(buf)
        else this.queue(buf)
    }
    function end () {
        if (buffer) buffer.push(null)
        else this.queue(null)
    }
}
