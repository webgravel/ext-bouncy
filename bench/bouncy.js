var bouncy = require('../');

module.exports = function (port) {
    return bouncy(function (req, bounce) { bounce(port) });
};

setInterval(function () {
    var mb = process.memoryUsage().heapTotal / 1024 / 1024;
    var s = String(Math.round(mb * 10) / 10);
    var pad = Array(Math.max(1, 6 - s.length + 1)).join(' ');
    console.log(pad + s + ' M');
}, 1000);
