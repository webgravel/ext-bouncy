// bounce requests received on :8001 along to :8000

var bouncy = require('../');

bouncy(function (req, bounce) {
    bounce(8000);
}).listen(8001);
