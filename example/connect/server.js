var connect, corser, app;

connect = require("connect");
corser = require("../../lib/corser");

app = connect();

app.use(corser.create());

app.use(function (req, res) {
    res.writeHead(200);
    res.end("Nice weather today, huh?");
});

app.listen(1337);

console.log("Server running on port 1337.");
