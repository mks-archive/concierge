var helper = require("./concierge-helper.js");
var http = require('http');

helper.demoApiName = 'foursquare';

/**
 * THIS FUNCTION FOR INITIAL DEVELOPMENT AND TESTING ONLY
 * We need a better form handling engine once we get the
 * fundamental architecture issues worked out.
 */
function writeOutputForm(response, params) {
	var fs = require('fs');

	fs.readFile('./form.html', function(err, form) {
		if (err) {
			throw err;
		}

		var html = form.toString();

		if (params.hasOwnProperty('js_code') ) {
			html = html.replace("{js_code}", params.js_code);
		}

		if (params.hasOwnProperty('api_name') ) {
			html = html.replace("{api_name}", params.api_name);
		}
		response.end(html);
	});
}

var server = http.createServer();

server.on('request', function (request, response) {
	console.log('Got a hit.');

	response.writeHead(200, "OK", {'Content-Type':'text/html'});

	var urlParts = request.url.split('/');

	switch (request.method + '/' + urlParts[1]) {
		case 'GET/':
			writeOutputForm( response, {
				api_name: helper.demoApiName,
				js_code: helper.loadExampleCode('demo',helper.demoApiName)
			});
			break;

		case 'GET/examples':
			var concierge = require('./concierge.js')._setNodeArgs(request, response);
			var $api = concierge.load(urlParts[2]);
			var fs = require('fs');
			$api.credentials = helper.loadCredentials(urlParts[2]);
			var codeToRun = helper.loadExampleCode(urlParts[2],urlParts[3]);
			var result = require("./runner.js").run($api,codeToRun);
			if ( typeof result == 'string' )
				concierge.out( result );
			break;

		case 'POST/run':
			var reply = '';

			request.on('data', function (chunk) {
				console.log("Received body data: " + chunk.toString());

				reply += chunk.toString();
			});

			request.on('end', function () {
				try {
					var queryString = require('querystring');

					var concierge = require('./concierge.js')._setNodeArgs(request, response);

					var query = queryString.parse(reply);

					var codeToRun = query.js_code.trim();
					var apiName = query.api_name.trim();

					var $api = concierge.load(apiName);

					/**
					 * Credentials need to be able to be loaded from either POST or embedded in js_code
					 */
					$api.credentials = helper.loadCredentials(apiName);

					require("./runner.js").run($api, apiName, codeToRun);

				} catch (err) {
					response.end("Unknown error.");
				}

				//writeOutputForm(response, query);
			});

			break;

		default:
			response.writeHead(301, {'Location':'/'});
			response.end("Nothing to see here. Move along. Nothing to see.");
			break;
	}
});

server.listen(8000, "127.0.0.1");

console.log('Server running at http://127.0.0.1:8000/');
