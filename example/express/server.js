var express, corser, app;

express = require("express");
corser = require("../../lib/corser");

app = express();

app.use(corser.create());

app.get("/", function (req, res) {
    res.writeHead(200);
    res.end("Nice weather today, huh?");
});

app.listen(1337);

console.log("Server running on port 1337.");
