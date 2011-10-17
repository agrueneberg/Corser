var http, port;
http = require('http');
port = 80;
http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
        message: req.headers.host + ' answered a ' + req.method + ' request.'
    }));
}).listen(port);
console.log('Server running on port ' + port + '.');
