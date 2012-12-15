var test = require('tap').test;
var insertHeaders = require('../lib/insert_headers');
var splitUp = require('./lib/split_up.js');

test('insert headers', function (t) {
    t.plan(50 * 3);
    var msg = [
        'POST / HTTP/1.1',
        'Host: beep',
        '',
        'sound=boop'
    ].join('\r\n');
    
    for (var i = 0; i < 50; i++) {
        var bufs = splitUp(msg);
        t.equal(bufs.map(function (b) {
            return String(b[0].slice(b[1],b[2]));
        }).join(''), msg);
        
        var bufs_ = bufs.slice();
        
        var n = insertHeaders(bufs, { foo : 'bar', baz : 'quux' });
        t.equal(n, 'foo: bar\r\nbaz: quux\r\n'.length);
        t.ok(
            bufs.length === bufs_.length + 2
            || bufs.length === bufs_.length + 3
        );
    }
    t.end();
});
