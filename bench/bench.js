#!/usr/bin/env node
var name = process.argv[2];

var p0 = 7000;
var p1 = 7001;

var proxy = require('./' + name)(p1);
proxy.listen(p0);

var http = require('http');
var server = http.createServer(function (req, res) {
    res.end('beepity boop');
});
server.listen(p1);

console.log('ab -n 5000 -c 10 http://localhost:' + p0 + '/');
