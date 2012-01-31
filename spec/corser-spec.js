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
        // Add dummy handler.
        options.handler = function (req, res) {
            res.writeHead(200);
            res.end();
        };
        server = http.createServer(function (req, res) {
            corser.requestListener(req, res, options);
        });
        server.listen(port, host, function () {
            callback();
        });
    };

    describe("General", function () {

        beforeEach(function () {
            createServer({}, asyncSpecDone);
            asyncSpecWait();
        });

        it("should fail if \"handler\" is not present in the options", function () {
            expect(function () {
                corser.createServer({});
            }).toThrow();
        });

        it("should pass if the \"Origin\" header is not present", function () {
            http.get(request, function (res) {
                expect(res.statusCode).toEqual(200);
                asyncSpecDone();
            });
            asyncSpecWait();
        });

    });

    describe("Origin Matching", function () {

        describe("Without Origin Restriction", function () {

            beforeEach(function () {
                createServer({}, asyncSpecDone);
                asyncSpecWait();
            });

            it("should pass for any origin", function () {
                request.headers["Origin"] = "example.org";
                http.get(request, function (res) {
                    expect(res.statusCode).toEqual(200);
                    asyncSpecDone();
                });
                asyncSpecWait();
            });

        });

        describe("With Origin Restriction", function () {

            beforeEach(function () {
                createServer({
                    origins: ["example.com"],
                }, asyncSpecDone);
                asyncSpecWait();
            });

            it("should pass if the origins match", function () {
                request.headers["Origin"] = "example.com";
                http.get(request, function (res) {
                    expect(res.statusCode).toEqual(200);
                    asyncSpecDone();
                });
                asyncSpecWait();
            });

            it("should fail if the given origin is not in the list of origins", function () {
                request.headers["Origin"] = "fake.com";
                http.get(request, function (res) {
                    expect(res.statusCode).toEqual(400);
                    asyncSpecDone();
                });
                asyncSpecWait();
            });

            it("should fail if the given origin is in the list of origins, but not a case-sensitive match", function () {
                request.headers["Origin"] = "eXaMpLe.cOm";
                http.get(request, function (res) {
                    expect(res.statusCode).toEqual(400);
                    asyncSpecDone();
                });
                asyncSpecWait();
            });

        });

    });

    describe("Preflight Request", function () {

        beforeEach(function () {
            request.method = "OPTIONS";
            request.headers["Origin"] = "example.com";
        });

        describe("General", function () {

            beforeEach(function () {
                createServer({}, asyncSpecDone);
                asyncSpecWait();
            });

            it("should fail if an Access-Control-Request-Method header is not present", function () {
                var req;
                req = http.request(request, function (res) {
                    expect(res.statusCode).toEqual(400);
                    asyncSpecDone();
                });
                req.end();
                asyncSpecWait();
            });

            it("should pass if the Access-Control-Request-Method header contains a simple method", function () {
                var req;
                request.headers["Access-Control-Request-Method"] = "GET";
                req = http.request(request, function (res) {
                    expect(res.statusCode).toEqual(200);
                    asyncSpecDone();
                });
                req.end();
                asyncSpecWait();
            });

            it("should fail if the Access-Control-Request-Method header contains a non-simple method", function () {
                var req;
                request.headers["Access-Control-Request-Method"] = "PUT";
                req = http.request(request, function (res) {
                    expect(res.statusCode).toEqual(405);
                    asyncSpecDone();
                });
                req.end();
                asyncSpecWait();
            });

            it("should pass if the Access-Control-Request-Headers header contains a simple header", function () {
                var req;
                request.headers["Access-Control-Request-Method"] = "GET";
                request.headers["Access-Control-Request-Headers"] = "Content-Language";
                req = http.request(request, function (res) {
                    expect(res.statusCode).toEqual(200);
                    asyncSpecDone();
                });
                req.end();
                asyncSpecWait();
            });

            it("should pass if the Access-Control-Request-Headers header contains multiple simple headers", function () {
                var req;
                request.headers["Access-Control-Request-Method"] = "GET";
                request.headers["Access-Control-Request-Headers"] = "Content-Language, cONTENT-tYPE,Pragma";
                req = http.request(request, function (res) {
                    expect(res.statusCode).toEqual(200);
                    asyncSpecDone();
                });
                req.end();
                asyncSpecWait();
            });

            it("should fail if the Access-Control-Request-Headers header contains a non-simple header", function () {
                var req;
                request.headers["Access-Control-Request-Method"] = "GET";
                request.headers["Access-Control-Request-Headers"] = "X-Corser";
                req = http.request(request, function (res) {
                    expect(res.statusCode).toEqual(400);
                    asyncSpecDone();
                });
                req.end();
                asyncSpecWait();
            });

            it("should fail if the Access-Control-Request-Headers header contains multiple non-simple headers", function () {
                var req;
                request.headers["Access-Control-Request-Method"] = "GET";
                request.headers["Access-Control-Request-Headers"] = "X-Corser, y-sOMETHING,Z-SomethingElse";
                req = http.request(request, function (res) {
                    expect(res.statusCode).toEqual(400);
                    asyncSpecDone();
                });
                req.end();
                asyncSpecWait();
            });

            it("should pass having Access-Control-Allow-Methods and Access-Control-Allow-Headers headers", function () {
                var req;
                request.headers["Access-Control-Request-Method"] = "GET";
                req = http.request(request, function (res) {
                    expect(res.statusCode).toEqual(200);
                    expect(res.headers["access-control-allow-methods"]).toEqual(corser.simpleMethods.join(","));
                    expect(res.headers["access-control-allow-headers"]).toEqual(corser.simpleResponseHeaders.join(","));
                    asyncSpecDone();
                });
                req.end();
                asyncSpecWait();
            });

        });

        describe("With Additional Methods", function () {
            var additionalMethods;

            beforeEach(function () {
                additionalMethods = corser.simpleMethods.concat(["PUT", "DELETE"]);
                createServer({
                    methods: additionalMethods
                }, asyncSpecDone);
                asyncSpecWait();
            });

            it("should pass listing all given methods in the Access-Control-Allow-Methods header", function () {
                var req;
                request.headers["Access-Control-Request-Method"] = "GET";
                req = http.request(request, function (res) {
                    expect(res.statusCode).toEqual(200);
                    expect(res.headers["access-control-allow-methods"]).toEqual(additionalMethods.join(","));
                    expect(res.headers["access-control-allow-headers"]).toEqual(corser.simpleResponseHeaders.join(","));
                    asyncSpecDone();
                });
                req.end();
                asyncSpecWait();
            });

        });

        describe("With Additional Headers", function () {
            var additionalHeaders;

            beforeEach(function () {
                additionalHeaders = corser.simpleResponseHeaders.concat(["X-Corser"]);
                createServer({
                    headers: additionalHeaders
                }, asyncSpecDone);
                asyncSpecWait();
            });

            it("should pass listing all given headers in the Access-Control-Allow-Headers header", function () {
                var req;
                request.headers["Access-Control-Request-Method"] = "GET";
                req = http.request(request, function (res) {
                    expect(res.statusCode).toEqual(200);
                    expect(res.headers["access-control-allow-methods"]).toEqual(corser.simpleMethods.join(","));
                    expect(res.headers["access-control-allow-headers"]).toEqual(additionalHeaders.join(","));
                    asyncSpecDone();
                });
                req.end();
                asyncSpecWait();
            });

        });

    });

    describe("Actual Request", function () {

        describe("Without Origin Restriction", function () {

            beforeEach(function () {
                createServer({}, asyncSpecDone);
                asyncSpecWait();
            });

            it("should have an Access-Control-Allow-Origin header of \"*\"", function () {
                request.headers["Origin"] = "example.com";
                http.get(request, function (res) {
                    expect(res.statusCode).toEqual(200);
                    expect(res.headers["access-control-allow-origin"]).toEqual("*");
                    asyncSpecDone();
                });
                asyncSpecWait();
            });

        });

        describe("With Origin Restriction", function () {

            beforeEach(function () {
                createServer({
                    origins: ["example.com"]
                }, asyncSpecDone);
                asyncSpecWait();
            });

            it("should have an Access-Control-Allow-Origin header with the given origin as a value", function () {
                request.headers["Origin"] = "example.com";
                http.get(request, function (res) {
                    expect(res.statusCode).toEqual(200);
                    expect(res.headers["access-control-allow-origin"]).toEqual("example.com");
                    asyncSpecDone();
                });
                asyncSpecWait();
            });

        });

        describe("Without Additional Headers", function () {

            beforeEach(function () {
                createServer({}, asyncSpecDone);
                asyncSpecWait();
            });

            it("should not have an Access-Control-Allow-Headers header", function () {
                request.headers["Origin"] = "example.com";
                http.get(request, function (res) {
                    expect(res.statusCode).toEqual(200);
                    expect(res.headers["access-control-allow-headers"]).toEqual(undefined);
                    asyncSpecDone();
                });
                asyncSpecWait();
            });

        });

        describe("With Additional Headers", function () {
            var additionalHeaders;

            beforeEach(function () {
                additionalHeaders = corser.simpleResponseHeaders.concat(["X-Corser"]);
                createServer({
                    headers: additionalHeaders
                }, asyncSpecDone);
                asyncSpecWait();
            });

            it("should have an Access-Control-Allow-Headers header with all the given headers as value", function () {
                request.headers["Origin"] = "example.com";
                http.get(request, function (res) {
                    expect(res.statusCode).toEqual(200);
                    expect(res.headers["access-control-expose-headers"]).toEqual("X-Corser");
                    asyncSpecDone();
                });
                asyncSpecWait();
            });

        });

    });

});
