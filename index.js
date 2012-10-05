
var codeToRun = '$api.result.status';

function outForm( response ) {
	var fs = require('fs');
	fs.readFile('./form.html',function (err, form) {
		if (err) throw err;
		var html = form.toString().replace("{code}",codeToRun);
		response.write(html);
		response.end();

	});
}

	var http = require('http');
	http.createServer(function (request, response) {
		console.log('Got a hit.');
		response.writeHead(200, "OK", {'Content-Type': 'text/html'});

		var httpPOSTbody = '';
		switch ( request.method + request.url ) {
			case 'GET/':
				outForm(response);
				break;

			case 'POST/run':
				request.on( 'data', function(chunk) {
					console.log("Received body data: "+chunk.toString());
					httpPOSTbody += chunk.toString();
				});

				request.on( 'end', function() {
					try {
						var $api = require('./../wwwhg/concierge.js');
						$api.__fixup(request,response);
						var qs = require('querystring');
						codeToRun = qs.parse(httpPOSTbody).code.trim();
						var result = require("./runner").run( $api, codeToRun );
						response.write( result );
					} catch (err) {
						response.write( "Unknown error." );
					}
					outForm(response,httpPOSTbody);
				});

				break;

			default:
				response.writeHead(301, {'Location': '/'});
				response.end( "Nothing to see here. Move along. Nothing to see." );
				break;
		}

	}).listen(8000, "127.0.0.1");
	console.log('Server running at http://127.0.0.1:8000/');
