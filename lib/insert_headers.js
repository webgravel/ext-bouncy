var through = require('through');

module.exports = function (headers) {
    var tr = through(write);
    var inHeader = true;
    var headersLower = Object.keys(headers)
        .reduce(function (acc, key) {
            acc[key.toLowerCase()] = headers[key];
            return acc;
        }, {})
    ;
    var line = '';
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
                this.queue(Object.keys(headers).map(function (key) {
                    return key + ': ' + headers[key];
                }).join('\r\n') + '\r\n\r\n');
                return this.queue(buf.slice(i));
            }
            
            var m = line.match(/^([^:]+)\s*:/);
            if (!m) {
                this.queue(line + '\n');
            }
            else {
                var key = m[1];
                var lowerKey = key.toLowerCase();
                
                if (!headersLower[lowerKey]) {
                    this.queue(line + '\n');
                }
            }
            line = '';
        }
    }
}
