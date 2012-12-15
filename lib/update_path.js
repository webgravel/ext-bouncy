module.exports = function (bufs, path) {
    var ix = indexOf(bufs, ' ', 0, 0);
    var jx = indexOf(bufs, ' ', ix[0], ix[1] + 1);
    
    var ib = bufs[ix[0]];
    var jb = bufs[jx[0]];
    
    var before = ib[0].slice(ib[1], ix[1] + 1);
    var after = jb[0].slice(jb[1] + jx[1], jb[2]);
    var middle = Buffer.isBuffer(path) ? path : new Buffer(path);
    
    bufs.splice(
        ix[0],
        jx[0] - ix[0] + 1,
        [ before, 0, before.length ],
        [ middle, 0, middle.length ],
        [ after, 0, after.length ]
    );
    
    return jx[2] - middle.length;
};

function indexOf (bufs, c, startI, startJ) {
    var code = c.charCodeAt(0);
    var bytes = 0;
    
    for (var i = startI; i < bufs.length; i++) {
        var buf = bufs[i][0];
        var s = bufs[i][1];
        var e = bufs[i][2];
        
        for (var j = i === startI ? startJ : 0; j < buf.length; j++) {
            if (buf[s+j] === code) return [ i, j, bytes ];
            bytes ++;
        }
    }
}
