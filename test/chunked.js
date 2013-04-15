var test = require('tap').test;
var bouncy = require('../');
var http = require('http');
var net = require('net');
var lazy = require('lazy');

test('chunked transfers should be transparent', function (t) {
    t.plan(2);
    
    var s0 = bouncy(function (req, bounce) {
        t.equal(req.headers.host, 'beepity.boop');
        bounce(s1.address().port);
    });
    
    var s1 = net.createServer(function (c) {
        lazy(c).lines.map(String).forEach(function (line) {
            if (line === '' || line === '\r') {
                c.write([
                    'HTTP/1.1 200 200 OK',
                    'Content-Type: text/plain',
                    'Transfer-Encoding: chunked',
                    'Connection: close',
                    '',
                    ''
                ].join('\r\n'));
            }
        });
        
        var chunks = [
            function () { c.write('4\r\nabcd\r\n') },
            function () { c.write('5\r\nefghi\r\n') },
            function () { c.write('7\r\njklmnop\r\n') },
            function () { c.write('0\r\n'); c.end() },
        ];
        
        var iv = setInterval(function () {
            var fn = chunks.shift();
            if (fn) fn()
            else clearInterval(iv)
        }, 25);
    });
    
    s1.listen(connect);
    s0.listen(connect);
    
    var connected = 0;
    function connect () {
        if (++connected !== 2) return;
        
        var c = net.connect(s0.address().port, function () {
            c.write([
                'GET / HTTP/1.1',
                'Host: beepity.boop',
                '',
                ''
            ].join('\r\n'));
            
            lazy(c).lines.map(String).join(function (lines) {
                t.deepEqual(lines, [
                    'HTTP/1.1 200 200 OK\r',
                    'Content-Type: text/plain\r',
                    'Transfer-Encoding: chunked\r',
                    'Connection: close\r',
                    '\r',
                    '4\r',
                    'abcd\r',
                    '5\r',
                    'efghi\r',
                    '7\r',
                    'jklmnop\r',
                    '0\r'
                ]);
                
                t.end();
                s0.close();
                s1.close();
            });
        });
    }
});
