var test = require('tap').test;
var http = require('http');
var net = require('net');
var bouncy = require('../');

var listening = (function () {
    var pending = 2;
    return function () {
        if (--pending === 0) runTest();
    };
})();

var server = http.createServer(function (req, res) {
    res.setHeader('content-type', 'text/plain');
    res.write('beep boop');
    res.end();
});
server.listen(0, listening);
var port = server.address().port;

var bs = bouncy(function (req, bounce) {
    bounce(port);
});
bs.listen(0, listening);
var bport = bs.address().port;

function flurry (t, cb) {
    var pending = 50;
    for (var i = 0; i < 50; i++) {
        check(t, function () {
            if (--pending === 0) cb();
        });
    }
}

function runTest () {
    test('check for leaks', function (t) {
        t.plan(50 * 2 + 1);
        
        flurry(t, function () {
            var baseline = process.memoryUsage();
            flurry(t, function () {
                var mark = process.memoryUsage();
                t.ok(baseline.heapUsed * 1.1 < mark.heapUsed);
            });
        });
        
        t.on('end', function () {
            server.close();
            bs.close();
        });
    });
}

function check (t, cb) {
    var opts = {
        path : '/',
        port : bport
    };
    http.get(opts, function (res) {
        var data = '';
        res.on('data', function (buf) { data += buf });
        res.on('end', function () {
            t.equal(data, 'beep boop');
            cb();
        });
    });
}
