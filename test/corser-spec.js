var expect;

expect = require("expect.js");

describe("Corser", function () {

    var http, corser, createServer, host, port, request, server;

    beforeEach(function () {
        http = require("http");
        corser = require("../lib/corser");
        host = "localhost";
        port = 25252;
        request = {
            host: host,
            port: port,
            headers: {}
        };
    });

    afterEach(function () {
        server.close();
    });

    createServer = function (options, callback) {
        server = http.createServer(function (req, res) {
            var requestListener;
            requestListener = corser.create(options);
            requestListener(req, res, function () {
                res.writeHead(200);
                res.end();
            });
        });
        server.listen(port, host, function () {
            callback();
        });
    };

    describe("General", function () {

        beforeEach(function (done) {
            createServer({}, done);
        });

        it("should terminate if the \"Origin\" header is not present", function (done) {
            http.get(request, function (res) {
                expect(res.statusCode).to.equal(200);
                done();
            });
        });

    });

    describe("Origin Matching", function () {

        describe("Without Origin Restriction", function () {

            beforeEach(function (done) {
                createServer({}, done);
            });

            it("should pass for any origin", function (done) {
                request.headers["Origin"] = "example.org";
                http.get(request, function (res) {
                    expect(res.statusCode).to.equal(200);
                    done();
                });
            });

        });

        describe("With Origin Restriction", function () {

            beforeEach(function (done) {
                createServer({
                    origins: ["example.com"],
                }, done);
            });

            it("should pass if the origins match", function (done) {
                request.headers["Origin"] = "example.com";
                http.get(request, function (res) {
                    expect(res.statusCode).to.equal(200);
                    done();
                });
            });

            it("should fail if the given origin is not in the list of origins", function (done) {
                request.headers["Origin"] = "fake.com";
                http.get(request, function (res) {
                    expect(res.statusCode).to.equal(400);
                    done();
                });
            });

            it("should fail if the given origin is in the list of origins, but not a case-sensitive match", function (done) {
                request.headers["Origin"] = "eXaMpLe.cOm";
                http.get(request, function (res) {
                    expect(res.statusCode).to.equal(400);
                    done();
                });
            });

        });

    });

    describe("Preflight Request", function () {

        beforeEach(function () {
            request.method = "OPTIONS";
            request.headers["Origin"] = "example.com";
        });

        describe("General", function () {

            beforeEach(function (done) {
                createServer({}, done);
            });

            it("should fail if an Access-Control-Request-Method header is not present", function (done) {
                var req;
                req = http.request(request, function (res) {
                    expect(res.statusCode).to.equal(400);
                    done();
                });
                req.end();
            });

            it("should pass if the Access-Control-Request-Method header contains a simple method", function (done) {
                var req;
                request.headers["Access-Control-Request-Method"] = "GET";
                req = http.request(request, function (res) {
                    expect(res.statusCode).to.equal(200);
                    done();
                });
                req.end();
            });

            it("should fail if the Access-Control-Request-Method header contains a non-simple method", function (done) {
                var req;
                request.headers["Access-Control-Request-Method"] = "PUT";
                req = http.request(request, function (res) {
                    expect(res.statusCode).to.equal(405);
                    done();
                });
                req.end();
            });

            it("should pass if the Access-Control-Request-Headers header contains a simple request header", function (done) {
                var req;
                request.headers["Access-Control-Request-Method"] = "GET";
                request.headers["Access-Control-Request-Headers"] = "Content-Language";
                req = http.request(request, function (res) {
                    expect(res.statusCode).to.equal(200);
                    done();
                });
                req.end();
            });

            it("should pass if the Access-Control-Request-Headers header contains multiple, differently formatted simple request headers", function (done) {
                var req;
                request.headers["Access-Control-Request-Method"] = "GET";
                request.headers["Access-Control-Request-Headers"] = "Accept, cONTENT-lANGUAGE,content-language";
                req = http.request(request, function (res) {
                    expect(res.statusCode).to.equal(200);
                    done();
                });
                req.end();
            });

            it("should fail if the Access-Control-Request-Headers header contains a non-simple header", function (done) {
                var req;
                request.headers["Access-Control-Request-Method"] = "GET";
                request.headers["Access-Control-Request-Headers"] = "X-Corser";
                req = http.request(request, function (res) {
                    expect(res.statusCode).to.equal(400);
                    done();
                });
                req.end();
            });

            it("should fail if the Access-Control-Request-Headers header contains multiple non-simple headers", function (done) {
                var req;
                request.headers["Access-Control-Request-Method"] = "GET";
                request.headers["Access-Control-Request-Headers"] = "X-Corser, y-sOMETHING,Z-SomethingElse";
                req = http.request(request, function (res) {
                    expect(res.statusCode).to.equal(400);
                    done();
                });
                req.end();
            });

            it("should pass having Access-Control-Allow-Methods and Access-Control-Allow-Headers headers", function (done) {
                var req;
                request.headers["Access-Control-Request-Method"] = "GET";
                req = http.request(request, function (res) {
                    expect(res.statusCode).to.equal(200);
                    expect(res.headers["access-control-allow-methods"]).to.equal(corser.simpleMethods.join(","));
                    expect(res.headers["access-control-allow-headers"]).to.equal(corser.simpleRequestHeaders.concat(["Origin"]).join(","));
                    done();
                });
                req.end();
            });

        });

        describe("With Additional Methods", function () {
            var additionalMethods;

            beforeEach(function (done) {
                additionalMethods = corser.simpleMethods.concat(["PUT", "DELETE"]);
                createServer({
                    methods: additionalMethods
                }, done);
            });

            it("should pass listing all given methods in the Access-Control-Allow-Methods header", function (done) {
                var req;
                request.headers["Access-Control-Request-Method"] = "GET";
                req = http.request(request, function (res) {
                    expect(res.statusCode).to.equal(200);
                    expect(res.headers["access-control-allow-methods"]).to.equal(additionalMethods.join(","));
                    expect(res.headers["access-control-allow-headers"]).to.equal(corser.simpleRequestHeaders.concat(["Origin"]).join(","));
                    done();
                });
                req.end();
            });

        });

        describe("With Additional Request Headers", function () {
            var requestHeaders;

            beforeEach(function (done) {
                requestHeaders = corser.simpleRequestHeaders.concat(["X-Corser"]);
                createServer({
                    requestHeaders: requestHeaders
                }, done);
            });

            it("should pass listing all given headers in the Access-Control-Allow-Headers header", function (done) {
                var req;
                request.headers["Access-Control-Request-Method"] = "GET";
                req = http.request(request, function (res) {
                    expect(res.statusCode).to.equal(200);
                    expect(res.headers["access-control-allow-methods"]).to.equal(corser.simpleMethods.join(","));
                    expect(res.headers["access-control-allow-headers"]).to.equal(requestHeaders.join(","));
                    done();
                });
                req.end();
            });

        });

    });

    describe("Actual Request", function () {

        describe("Without Origin Restriction", function () {

            beforeEach(function (done) {
                createServer({}, done);
            });

            it("should have an Access-Control-Allow-Origin header of \"*\"", function (done) {
                request.headers["Origin"] = "example.com";
                http.get(request, function (res) {
                    expect(res.statusCode).to.equal(200);
                    expect(res.headers["access-control-allow-origin"]).to.equal("*");
                    done();
                });
            });

        });

        describe("With Origin Restriction", function () {

            beforeEach(function (done) {
                createServer({
                    origins: ["example.com"]
                }, done);
            });

            it("should have an Access-Control-Allow-Origin header with the given origin as a value", function (done) {
                request.headers["Origin"] = "example.com";
                http.get(request, function (res) {
                    expect(res.statusCode).to.equal(200);
                    expect(res.headers["access-control-allow-origin"]).to.equal("example.com");
                    done();
                });
            });

        });

        describe("Without Additional Headers", function () {

            beforeEach(function (done) {
                createServer({}, done);
            });

            it("should not have an Access-Control-Allow-Headers header", function (done) {
                request.headers["Origin"] = "example.com";
                http.get(request, function (res) {
                    expect(res.statusCode).to.equal(200);
                    expect(res.headers["access-control-allow-headers"]).to.equal(undefined);
                    done();
                });
            });

        });

        describe("With Additional Response Headers", function () {
            var responseHeaders;

            beforeEach(function (done) {
                responseHeaders = corser.simpleResponseHeaders.concat(["X-Corser"]);
                createServer({
                    responseHeaders: responseHeaders
                }, done);
            });

            it("should have an Access-Control-Expose-Headers header with all the exposed response headers as value", function (done) {
                request.headers["Origin"] = "example.com";
                http.get(request, function (res) {
                    expect(res.statusCode).to.equal(200);
                    expect(res.headers["access-control-expose-headers"]).to.equal("X-Corser");
                    done();
                });
            });

        });

    });

});
