var http = require('http');
http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
        message: req.headers.host + ' answered a ' + req.method + ' request.'
    }));
}).listen(80, '0.0.0.0');
console.log('Server running at http://127.0.0.1:1337/');
