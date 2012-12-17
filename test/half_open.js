var test = require('tap').test;
var bouncy = require('../');
var http = require('http');
var net = require('net');

var proxy = bouncy(function (req, res, bounce) {
    if (req.headers.host === 'robot') {
        bounce(server.address().port);
    }
    else {
        res.statusCode = 404;
        res.end('not found\n');
    }
});
proxy.listen(0);

var server = http.createServer(function (req, res) {
    res.end('beep boop\n');
});
server.listen(0);

test('half-open', function (t) {
    t.plan(1);
    var c = net.connect(proxy.address().port);
    
    var data = '';
    c.on('data', function (buf) { data += buf });
    c.on('end', function () {
        var lines = data.split(/\r?\n/);
        t.ok(lines.some(function (line) {
            return line === 'beep boop';
        }));
    });
    
    c.end([
        'GET / HTTP/1.1',
        'Host: robot',
        'Connection: close',
        '',
        ''
    ].join('\r\n'));
});

test(function (t) {
    server.close();
    proxy.close();
    t.end();
});
