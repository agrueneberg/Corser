var http, https, url;

http = require("http");
https = require("https");
url = require("url");

exports.create = function () {
    return function (req, res) {
        var parsedUrl, proxyUrl, proxyReq, proxyResHandler;
        parsedUrl = url.parse(req.url, true);
        if (parsedUrl.query.hasOwnProperty("url")) {
            proxyUrl = url.parse(parsedUrl.query.url);
            var proxyOptions = {
                "host": proxyUrl.host,
                "path": proxyUrl.pathname,
                "method": req.method,
                "headers": {}
            };
            // Add auth information if available.
            if (proxyUrl.hasOwnProperty("auth")) {
                proxyOptions.auth = proxyUrl.auth;
            }
            // Copy some useful HTTP headers.
            if (req.headers.hasOwnProperty("accept")) proxyOptions.headers["Accept"] = req.headers["accept"];
            if (req.headers.hasOwnProperty("content-type")) proxyOptions.headers["Content-Type"] = req.headers["content-type"];
            // url.parse does not parse localhost correctly.
            if (proxyOptions.host.indexOf("localhost") !== -1) {
                proxyOptions.host = proxyOptions.host.split(":")[0];
            }
            // url.parse does not parse complex pathnames correctly.
            proxyOptions.path += req.url.split(proxyOptions.path)[1];
            // Different protocol, different module, but same response handler.
            proxyResHandler = function (proxyRes) {
                var resHeaders;
                resHeaders = {};
                if (proxyRes.headers.hasOwnProperty("content-type")) resHeaders["Content-Type"] = proxyRes.headers["content-type"];
                res.writeHead(200, resHeaders);
                proxyRes.on("data", function (chunk) {
                    res.write(chunk);
                });
                proxyRes.on("end", function () {
                    res.end();
                });
            };
            // TODO: Throw error for unsupported protocols.
            if (proxyUrl.protocol === "http:") {
                proxyOptions.port = proxyUrl.port || 80;
                proxyReq = http.request(proxyOptions, proxyResHandler);
            } else if (proxyUrl.protocol === "https:") {
                proxyOptions.port = proxyUrl.port || 443;
                proxyReq = https.request(proxyOptions, proxyResHandler);
            }
            proxyReq.on("error", function (e) {
                res.writeHead(500);
                res.end("Captain, we crashed: " + e.code + "\n");
            });
            // I tried to use pipes here, but sometimes they had a hiccup.
            req.on("data", function (chunk) {
                proxyReq.write(chunk);
            });
            req.on("end", function () {
                proxyReq.end();
            });
        } else {
            res.writeHead(400);
            res.end("\"url\", did you pass it?\n");
        }
    };
};
