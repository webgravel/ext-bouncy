module.exports = function (msg) {
    var bufs = [];
    for (
        var i = 0, j = Math.floor(Math.random() * (msg.length + 1));
        j <= msg.length;
        j += Math.floor(Math.random() * (msg.length - j + 1))
    ) {
        var s = new Buffer(msg.slice(i, j));
        var start = Math.floor(10 * Math.random());
        var end = start + s.length;
        var trailing = Math.floor(10 * Math.random());
        
        var buf = new Buffer(end + trailing);
        
        for (var k = start; k < end; k++) {
            buf[k] = s[k - start];
        }
        
        bufs.push([ buf, start, end ]);
        i = j;
        if (j === msg.length) break;
    }
    
    return bufs;
}
