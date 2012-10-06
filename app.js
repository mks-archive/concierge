
var http = require('http');

function writeOutputForm(response, code) {
	var fs = require('fs');

	fs.readFile('./form.html',function (err, form) {
		if (err) {
			throw err;
		}

		var html = form.toString();

		if (code) {
			html.replace("{code}", code);
		} else {
			html.replace("{code}", "JSON.stringify(api);");
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
			outForm(response, null);
			break;

		case 'POST/run':
			var reply = '';

			request.on('data', function(chunk) {
				console.log("Received body data: " + chunk.toString());

				reply += chunk.toString();
			});

			request.on('end', function() {
				try {
					var concierge = require('./concierge.js');
					var queryString = require('querystring');
					var runner = require("./runner");

					concierge.__fixup(request,response);

					codeToRun = queryString.parse(reply).code.trim();

					var result = runner.run(concierge, codeToRun);

					response.write(result);
				} catch (err) {
					response.write("Unknown error.");
				}

				writeOutputForm(response, reply);
			});

			break;

		default:
			response.writeHead(301, {'Location': '/'});
			response.end( "Nothing to see here. Move along. Nothing to see." );
			break;
	}
});

server.listen(8000, "127.0.0.1");

console.log('Server running at http://127.0.0.1:8000/');
