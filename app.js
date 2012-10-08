var helper = require("./app-helper.js");
var http = require('http');
var fs = require('http');

helper.demoApiName = 'foursquare';

/**
 * THIS FUNCTION FOR INITIAL DEVELOPMENT AND TESTING ONLY
 * We need a better form handling engine once we get the
 * fundamental architecture issues worked out.
 */
function writeOutputForm(response, params) {
	fs = require('fs');

	fs.readFile('./form.html', function(err, form) {
		if (err) {
			throw err;
		}

		var html = form.toString();

		if (params.hasOwnProperty('script') ) {
			html = html.replace("{script}", params.script);
		}

		if (params.hasOwnProperty('api') ) {
			html = html.replace("{api}", params.api);
		}
		response.end(html);
	});
}

var server = http.createServer();

server.on('request', function (request, response) {

	response.writeHead(200, "OK", {'Content-Type':'text/html'});

	var urlParts = request.url.split('/');

	switch (request.method + '/' + urlParts[1]) {
		case 'GET/':
			writeOutputForm( response, {
				api: helper.demoApiName,
				script: helper.loadExampleCode('demo',helper.demoApiName)
			});
			break;

		case 'GET/results':
			fs = require('fs');
			var filePath = './results/'+ urlParts[2];
			if (fs.existsSync(filePath)) {
				var json = require('fs').readFileSync(filePath).toString();
				/**
				 * DAMN you chunkedEncoding, you caused me a lot of headache to figure out.
				 */
				response.chunkedEncoding = false;
				response.writeHead( 200, {
					'Content-Length': json.length,
					'Content-Type': 'application/json'
				});
				response.write( json );
			} else {
				response.statusCode = 404;
			}
			response.end();
			break;

		case 'GET/examples':
			var concierge = require('./concierge.js')._setNodeArgs(request, response);
			var $api = concierge.load(urlParts[2]);
			fs = require('fs');
			$api.credentials = helper.loadCredentials(urlParts[2]);
			var codeToRun = helper.loadExampleCode(urlParts[2],urlParts[3]);
			var result = require("./runner.js").run($api,urlParts[2],codeToRun);
			if ( typeof result == 'string' )
				concierge.out( result );
			break;

		case 'POST/run':
			var reply = '';

			request.on('data', function (chunk) {
				//console.log("Received body data: " + chunk.toString());

				reply += chunk.toString();
			});

			request.on('end', function () {
				try {
					var queryString = require('querystring');

					var concierge = require('./concierge.js')._setNodeArgs(request, response);

					var query = queryString.parse(reply);

					var codeToRun = query.script.trim();
					var apiName = query.api.trim();

					var $api = concierge.load(apiName);

					/**
					 * Credentials need to be able to be loaded from either POST or embedded in script
					 */
					$api.credentials = helper.loadCredentials(apiName);

					require("./runner.js").run($api, apiName, codeToRun);

				} catch (err) {
					response.write("ERROR: ");
					var msg = err.message + ' [' + err.type + ']:\n';
					for(var i=0;i<err.arguments.length;i++){
						msg+= '\targuments['+i+'] = "' + err.arguments[i] + '"';
						if ( i<err.arguments.length-1) {
							msg+= ',\n';
						}
					}
					response.end(msg);
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
