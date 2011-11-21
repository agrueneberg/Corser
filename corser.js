var argv, http, url;
argv = require("optimist").default("port", 80).alias("p", "port").argv;
http = require("http");
url = require("url");
http.createServer(function (req, res) {
    var parsedUrl, proxyUrl;
    // Enable Cross-Origin Resource Sharing (CORS).
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, HEAD, OPTIONS");
    parsedUrl = url.parse(req.url, true);
    if (parsedUrl.query.hasOwnProperty("url")) {
        proxyUrl = url.parse(parsedUrl.query.url);
        var proxyOptions = {
            "host": proxyUrl.host,
            "port": proxyUrl.port || 80,
            "path": proxyUrl.pathname,
            "method": req.method,
            "headers": {}
        };
        // Copy some useful HTTP headers.
        if (req.headers["accept"]) proxyOptions.headers["accept"] = req.headers["accept"];
        // url.parse does not parse localhost correctly.
        if (proxyOptions.host.indexOf("localhost") !== -1) {
            proxyOptions.host = proxyOptions.host.split(":")[0];
        }
        // url.parse does not parse complex pathnames correctly.
        proxyOptions.path += req.url.split(proxyOptions.path)[1];
        var proxyReq = http.request(proxyOptions, function (proxyRes) {
            var contentType;
            contentType = proxyRes.headers["content-type"] || "text/plain";
            res.writeHead(200, contentType);
            proxyRes.on("data", function (chunk) {
                res.write(chunk);
            });
            proxyRes.on("end", function () {
                res.end();
            });
        });
        proxyReq.on("error", function (e) {
            res.writeHead(500);
            res.end("Captain, we crashed: " + e.code + "\n");
        });
        proxyReq.end();
    } else {
        res.writeHead(400);
        res.end("\"url\", did you pass it?\n");
    }
}).listen(argv.port);
console.log("Server running at http://127.0.0.1:" + argv.port + "/");
