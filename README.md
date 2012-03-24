Corser
=======

A highly configurable, middleware compatible implementation of [CORS](http://www.w3.org/TR/cors/).

[![Build Status](https://secure.travis-ci.org/agrueneberg/Corser.png)](http://travis-ci.org/agrueneberg/Corser)


Examples
--------

### How to use Corser with `http`

    var http, corser, corserRequestListener;

    http = require("http");
    corser = require("corser");

    corserRequestListener = corser.create();

    http.createServer(function (req, res) {
        corserRequestListener(req, res, function () {
            // Finish preflight request.
            if (req.method === "OPTIONS") {
                res.writeHead(204);
                res.end();
            } else {
                res.writeHead(200);
                res.end("Nice weather today, huh?");
            }
        });
    }).listen(1337);

### How to use Corser as a middleware in Connect

See `example/connect/server.js` for a working example.

    var connect, corser;

    connect = require("connect");
    corser = require("../../lib/corser");

    connect.createServer(
        corser.create(),
        function (req, res, next) {
            // Finish preflight request.
            if (req.method === "OPTIONS") {
                res.writeHead(204);
                res.end();
            } else {
                res.writeHead(200);
                res.end("Nice weather today, huh?");
            }
        }
    ).listen(1337);

### HTTP Proxy

See `example/proxy/server.js` for a working example of a CORS-enabled HTTP proxy.


Configuration
-------------

A configuration object can be passed to `corser.create`.

### `origins`

A case-sensitive whitelist of origins. Unless unbound, if the request comes from an origin that is not in this list, it will not be handled by CORS.

Default: unbound, i.e. every origin is accepted.

### `methods`

An uppercase whitelist of methods. If the request uses a method that is not in this list, it will not be handled by CORS.

Default: simple methods (`GET`, `HEAD`, `POST`).

### `requestHeaders`

A case-insentitive whitelist of request headers. If the request uses a request header that is not in this list, it will not be handled by CORS.

Default: simple request headers (`Accept`, `Accept-Language`, `Content-Language`, `Content-Type`, `Last-Event-ID`).

### `responseHeaders`

A case-insensitive whitelist of response headers. Any response header that is not in this list will be filtered out by the user-agent (the browser).

Default: simple response headers (`Cache-Control`, `Content-Language`, `Content-Type`, `Expires`, `Last-Modified`, `Pragma`).

### `supportsCredentials`

A boolean that indicates if cookie credentials can be transfered as part of a CORS request. Currently, only a few HTML5 elements can benefit from this setting.

Default: `false`.

### `maxAge`

An integer that indicates the maximum amount of time in seconds that a preflight request is kept in the client-side preflight result cache.

Default: not set.


Issues
------

- [Chrome <= 17 does not respect `Access-Control-Expose-Headers`](http://code.google.com/p/chromium/issues/detail?id=87338). This has been fixed recently and is already included in the latest Canary build (tested with 19.0.1057.0).
