var test = require('tap').test;
var bouncy = require('../');
var net = require('net');
var through = require('through');

test('raw keep alive', function (t) {
    t.plan(1);
    t.on('end', function () {
        s.close();
    });
    var sent = false;
    
    var s = bouncy(function (req, res, bounce) {
        var tr = through(function () {}, function () {});
        bounce(tr);
        
        tr.queue([
            'HTTP/1.1 200 OK',
            '',
            ''
        ].join('\r\n'));
        
        setTimeout(function () {
            tr.queue(req.headers.host.toUpperCase());
            tr.queue(null);
        }, 75);
    });
    
    s.listen(0, function () {
        var port = s.address().port;
        var c = net.connect(port);
        
        setTimeout(function () {
            c.write([
                'GET /a HTTP/1.1',
                'Host: a',
                'Connection: keep-alive',
                '',
                ''
            ].join('\r\n'));
        }, 50);
        
        setTimeout(function () {
            c.write([
                'GET /b HTTP/1.1',
                'Host: b',
                'Connection: keep-alive',
                '',
                ''
            ].join('\r\n'));
        }, 100);
        
        setTimeout(function () {
            c.write([
                'GET /c HTTP/1.1',
                'Host: c',
                'Connection: close',
                '',
                ''
            ].join('\r\n'));
        }, 150);
        
        var data = '';
        c.on('data', function (buf) { data += buf });
        c.on('end', function () {
            console.log(data);
        });
    });
});
