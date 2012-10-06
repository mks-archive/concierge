
var http = require('http');

function writeOutputForm(response, code) {
	var fs = require('fs');

	fs.readFile('./form.html',function (err, form) {
		if (err) {
			throw err;
		}

		var html = form.toString();

		if (code) {
			html = html.replace("{code}", code);
		} else {
			html = html.replace("{code}", "JSON.stringify(api);");
		}

		response.write(html);

		response.end();
	});
}

var server = http.createServer();

server.on('request', function(request, response) {
	console.log('Got a hit.');

	response.writeHead(200, "OK", {'Content-Type': 'text/html'});

	switch (request.method + request.url) {
		case 'GET/':
			writeOutputForm(response, null);
			break;

		case 'POST/run':
			var reply = '';
			var code = '';

			request.on('data', function(chunk) {
				console.log("Received body data: " + chunk.toString());

				reply += chunk.toString();
			});

			request.on('end', function() {
				try {
					var queryString = require('querystring');

					var concierge = require('./concierge.js');
					var runner = require("./runner.js");

					concierge.__fixup(request,response);

					code = queryString.parse(reply).code.trim();

					var result = runner.run(concierge, code);

					response.write(result);
				} catch (err) {
					response.write("Unknown error.");
				}

				writeOutputForm(response, code);
			});

			break;

		default:
			response.writeHead(301, {'Location': '/'});
			response.end("Nothing to see here. Move along. Nothing to see.");
			break;
	}
});

server.listen(8000, "127.0.0.1");

console.log('Server running at http://127.0.0.1:8000/');
