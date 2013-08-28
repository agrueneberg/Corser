var connect, corser, app;

connect = require("connect");
corser = require("../../lib/corser");

app = connect();

app.use(corser.create());

app.use(function (req, res) {
    // Finish preflight request.
    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
    } else {
        res.writeHead(200);
        res.end("Nice weather today, huh?");
    }
});

app.listen(1337);

console.log("Server running on port 1337.");
