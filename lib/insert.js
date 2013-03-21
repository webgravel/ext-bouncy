var through = require('through');

module.exports = function (opts) {
    var tr = through(write);
    var inHeader = true;
    var headersLower = opts.headers
        && Object.keys(opts.headers).reduce(function (acc, key) {
            acc[key.toLowerCase()] = opts.headers[key];
            return acc;
        }, {})
    ;
    var line = '';
    var firstLine = true;
    return tr;
    
    function write (buf) {
        if (!inHeader) return this.queue(buf);
        
        for (var i = 0; i < buf.length; i++) {
            if (buf[i] !== 10) {
                line += String.fromCharCode(buf[i]);
                continue;
            }
            
            if (line === '' || line === '\r') {
                line = undefined;
                inHeader = false;
                if (opts.headers) {
                    this.queue(Object.keys(opts.headers).map(function (key) {
                        return key + ': ' + opts.headers[key];
                    }).join('\r\n') + '\r\n\r\n');
                }
                return this.queue(buf.slice(i));
            }
            
            if (firstLine) {
                firstLine = false;
                if (opts.method || opts.path) {
                    line = line.replace(/^(\S+)\s+(\S+)/, function (_, m, p) {
                        return (opts.method || m).toUpperCase()
                            + ' ' + (opts.path || p)
                        ;
                    });
                }
                this.queue(line + '\n');
                continue;
            }
            firstLine = false;
            
            var m = line.match(/^([^:]+)\s*:/);
            if (!m) {
                this.queue(line + '\n');
            }
            else {
                var key = m[1];
                var lowerKey = key.toLowerCase();
                
                if (headersLower && !headersLower[lowerKey]) {
                    this.queue(line + '\n');
                }
            }
            line = '';
        }
    }
}
