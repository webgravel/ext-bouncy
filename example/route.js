var bouncy = require('bouncy');

bouncy(function (req, bounce) {
    if (req.headers.host === 'beep.example.com') {
        bounce(8001).on('error', onerror);
    }
    else if (req.headers.host === 'boop.example.com') {
        bounce(8002).on('error', onerror);
    }
    
    req.on('error', onerror);
    function onerror () { req.destroy() }
}).listen(8000);
