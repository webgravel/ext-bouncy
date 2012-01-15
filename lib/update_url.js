module.exports = function (bufs, url) {
    var ix = indexOf(bufs, ' ', 0, 0);
    
    var before = bufs.slice(0, ix[0] - 1);
    if (ix[1] > 0) before.push(bufs[ix[0]].slice(0, bufs[ix[1] - 1]));
    
    var jx = indexOf(bufs, ' ', ix[0], ix[1]);
    var after = bufs.slice(jx[0] + 1);
    after.unshift(bufs[jx[0]].slice(jx[1]));
    
    var middle = Buffer.isBuffer(url) ? url : new Buffer(url);
    return before.concat(middle, after);
};

function indexOf (bufs, c, startI, startJ) {
    var code = c.charCodeAt(0);
    
    for (var i = startI; i < bufs.length; i++) {
        var buf = bufs[i];
        for (var j = i === startI ? startJ : 0; j < buf.length; j++) {
            if (buf[j] === code) return [ i, j ];
        }
    }
}
