Corser
=======

A [CORS](http://www.w3.org/TR/cors/)-enabled HTTP(S) reverse proxy.


Examples
--------

### URL

    http://localhost:1337/?url=http://enable-cors.org

`<host>/?url=<url>`: Loads and returns the content of url.

### With XMLHttpRequest

#### GET

    var xhr;
    xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:1337/?url=http://enable-cors.org");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log(xhr.responseText);
        }
    };
    xhr.send(null);

#### POST

    var doc, xhr;
    doc = {
        "some": "document"
    };
    xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:1337/?url=http://agrueneberg.iriscouch.com/playground");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log(xhr.responseText);
        }
    };
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(doc));


Installation
------------

* `npm install corser -g`
* `corser --port 1337`


Supported HTTP(S) Methods
----------------------

* `GET`
* `POST`
* `PUT`
* `DELETE`


Supported HTTP(S) Headers
----------------------

### Request

* `Accept`
* `Content-Type`

### Response

* `Content-Type`
