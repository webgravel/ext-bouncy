# bouncy

pipe raw http traffic from incoming http requests to remote endpoints

**this module presently only works on node 0.8**

[![build status](https://secure.travis-ci.org/substack/bouncy.png)](http://travis-ci.org/substack/bouncy)

![trampoline](http://substack.net/images/trampoline.png)

# example

## route.js

Route requests based on the host field to servers on ports 8001 and 8002:

``` js
var bouncy = require('bouncy');

var server = bouncy(function (req, res, bounce) {
    if (req.headers.host === 'beep.example.com') {
        bounce(8001);
    }
    else if (req.headers.host === 'boop.example.com') {
        bounce(8002);
    }
    else {
        res.statusCode = 404;
        res.end('no such host');
    }
});
server.listen(8000);
```

# var server = bouncy(opts={}, cb)

`bouncy(cb)` returns a new net.Server object that you can `.listen()` on.

If you specify `opts.key` and `opts.cert`, the connection will be set to secure
mode using tls. Do this if you want to make an https router.

If the arity of `cb` is 3, you'll get the response object `res` in
`cb(req, res, bounce)`.
Otherwise you just get `cb(req, bounce)`.

## bounce(stream, opts={})

Call this function when you're ready to bounce the request to a stream.

The exact request that was received will be written to `stream` and future
incoming data will be piped to and from it.

To send data to a different url path on the destination stream, you can specify
`opts.path`.

You can specify header fields to insert into the request with `opts.headers`.

By default, `"x-forwarded-for"`, `"x-forwarded-port"`, and `"x-forwarded-proto"`
are all automatically inserted into the outgoing header.

`bounce()` returns the stream object that it uses to connect to the remote host.

## bounce(port, ...), bounce(host, port, ...), bounce(url)

These variants of `bounce()` are sugar for
`bounce(net.connect(port))`
and
`bounce(net.connect(port, host))`.

Optionally you can pass port and host keys to `opts` and it does the same thing.

Passing `bounce()` a string that looks like a url (with or without `"http://"`)
will set the opts.host, opts.port, and opts.path accordingly.

# benchmark summary

```
              small message     4M message
                 (#/sec)          (#/sec)
           .----------------------------------
    direct |     2558.10          135.47
http-proxy |      537.30           36.72
    bouncy |      522.69           38.03
```

See bench/ for the complete results.

# install

With [npm](http://npmjs.org), to get the library do:

```
npm install bouncy
```

or to install the command-line tool do:

```
npm install -g bouncy
```

# license

MIT
