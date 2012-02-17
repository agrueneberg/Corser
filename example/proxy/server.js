var argv, http, corser, server, requestHeaders, responseHeaders, corserRequestListener, proxerRequestListener;

argv = require("optimist").default("port", 1337).alias("p", "port").argv;
http = require("http");
corser = require("../../lib/corser");
proxer = require("lib/proxer");

// In addition to simple HTTP request headers, let's also support Range.
requestHeaders = corser.simpleRequestHeaders.concat(["Range"]);
responseHeaders = corser.simpleResponseHeaders;

corserRequestListener = corser.create({
    requestHeaders: requestHeaders,
    responseHeaders: responseHeaders
});

proxerRequestListener = proxer.create({
    requestHeaders: requestHeaders,
    responseHeaders: responseHeaders
});

server = http.createServer(function (req, res) {
    corserRequestListener(req, res, function () {
        // Finish preflight request.
        if (req.method === "OPTIONS") {
            res.writeHead(204);
            res.end();
        } else {
            proxerRequestListener(req, res);
        }
    });
});
server.listen(argv.port);

console.log("Proxy running on port " + argv.port + ".");
