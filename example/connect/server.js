var argv, connect, corser;

argv = require("optimist").default("port", 1337).alias("p", "port").argv;
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
).listen(argv.port);

console.log("Server running on port " + argv.port + ".");
