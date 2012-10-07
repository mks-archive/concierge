/**
 * Concierge - A Node.js solution for using code-on-demand for a RESTful server.
 * API specific modules must set these
 * @type {Object}
 *
 * 	module.exports.credentials = {};
 * 	module.exports.service = {};
 * 	module.exports.links = {};
 *
 */

/**
 * Module local vars
 */
var $api;
var helper = require("./concierge-helper.js");
var nodeRequest = null;
var nodeResponse = null;

/**
 * Module exported properties
 */
module.exports.root;
module.exports.name = '$api';
module.exports.version = '0.0';
module.exports.protocol = 'https';
module.exports.server = {};
module.exports.request = {};
module.exports.response = helper.getDefaultResponse();
module.exports.result = {};

module.exports.onServiceInit = function(service){};

module.exports.filterOutput = function(output){return output;};

module.exports.out = function(){};


/**
 * Convenience properties
\ */
module.exports.host = '';
module.exports.port = 80;

/*
 * Load an API-specific Concierge
 */
module.exports.load = function( apiName ) {
	var api = require( './apis/' + apiName + '.js' );

	api.name = apiName;
	api = this.extend( api );

	return api;
};
module.exports.localUrl = function( path ) {
	var url = 'http://'+this.host+(this.port==80?'':':'+this.port) + '/'+path.replace(/^\/(.*)$/,'$');
	return url;
}
module.exports.extend = function( api ) {
	/**
	 * These are defined in Concierge, cannot be overridden by API
	 */
	api.GET = 		this.GET;
	api.PUT = 		this.PUT;
	api.POST = 		this.POST;
	api.DELETE = 	this.DELETE;
	api.PATCH = 	this.PATCH;
	api.NEW = 		this.NEW;
	api.DO = 			this.DO;

	/**
	 * These might be defined in API's concierge, if not, default.
	 */
	if ( api.onServiceInit == undefined )
		api.onServiceInit = this.onServiceInit;

	if ( api.filterOutput == undefined )
		api.filterOutput = this.filterOutput;

	/**
	 * Provide convenient access to these
	 */
	api.server = 		this.server;
	api.request = 	this.request;
	api.response = 	this.response;

	/**
	 * Provide convenient access to these
	 */
	api.code = 			this.code;
	api.header = 		this.header;
	api.location = 	this.location;


	/**
	 * Set some more convenience properties
	 */
	api.protocol = 	this.protocol;

	var hostParts = nodeRequest.headers.host.split(':');
	api.host = hostParts[0];

	if ( hostParts[1] != undefined )
		api.port = Number(hostParts[1]);

	api.localUrl = 	this.localUrl;
	/**
	 * Assign this so we can access it in file.createTempFile();
	 * @type {*}
	 */
	$api = api;

	api.out = this.out = function(value) {
		var filePath = 'results/' + $api.called + '.json';
		console.log( 'Write file: ./' + filePath );
		require('fs').writeFileSync( './' + filePath, value );
		var fileUrl = $api.localUrl( filePath );
		nodeResponse.writeHead(302,{Location: fileUrl});
		nodeResponse.end();
	};

	/**
	 * Provide reference back to root level $api object.
	 */
	api.root = this.root != undefined ? this.root : this;

	return api;
};

/*
 * Set HTTP status code
 */
module.exports.code = function( code ) {
	this.response = helper.getDefaultResponse();
	this.response.code = code;
	this.response.message = helper.getHttpStatusMesssage( code );
	return code;
};
/*
 * Set HTTP status code
 */
module.exports.location = function( uri, code ) {
	this.header( "Location", uri );
	this.code( code );
};
/*
 * Add a new header to the response object
 */
module.exports.header = function( name, value ) {
	this.response.headers.push( name + ": " + value );
};

module.exports._setNodeArgs = function(request,response) {
	nodeRequest = request;
	nodeResponse = response;
	return this;
};

/**
 * @return object|null;
 */
module.exports.GET = function( thing, key, data, callback ) {
	var args = helper.fixupArgs( thing, key, data, callback );

	console.log( this.name + ':' + args.thing );

	/**
	 * Clone the service object
	 */
	var service  = JSON.parse(JSON.stringify(this.service));

	/**
	 * Clone get it's URLs.
	 */
	service.path += '/' + this.links[args.thing].path;

	/**
	 * Let the API's Concierge add any auth parameters or other weirdness required for their APIs
	 */
	this.onServiceInit(service);

	console.log( 'Service Path: ' + this.service.path );

	/**
	 * Set by Master Concierge or API's Concierge, required to be 'http' or 'https'
	 */
	var protocol = require( this.protocol );

	var output = '';

	var host = this.host;
	var concierge = this.root;
	this.called = thing;
	var $api = this;
	var request = protocol.request(service,function(result) {

		console.log(host + ': ' + result.statusCode);

		result.setEncoding('utf8');

		result.on('data', function(chunk) {
			output += chunk;
		});

		result.on('end', function() {
			/**
			 * TODO: Don't assume out is only JSON here; add in Content-Type parsers instead.
			 * @type {*}
			 */
			concierge.code(result.statusCode);
			output = JSON.parse(output);
			output = $api.filterOutput(output);
			args.callback(JSON.stringify(output));
			if ( ! nodeResponse.finished ) {
				nodeResponse.end();
			}
		});

	});
	request.on('error', function(error) {
		console.log('error: ' + error.message);
	});

	request.end();

};
/*
 * result = thing.PUT( data );
 * result = thing.PUT( key, data );
 */
module.exports.PUT = function ( key, data, onResult ) {
	var args = helper.fixupArgs( key, data, onResult );
};
/*
 * result = thing.POST( data );
 * result = thing.POST( key, data );
 */
module.exports.POST = function ( key, data, onResult ) {
	var args = helper.fixupArgs( key, data, onResult );
};
/*
 * result = thing.DELETE( "thing" );
 * result = thing.DELETE( key );
 */
module.exports.DELETE = function ( key, data, onResult ) {
	var args = helper.fixupArgs( key, data, onResult );
};
/*
 * result = thing.PATCH( data );
 * result = thing.PATCH( key, data );
 */
module.exports.PATCH = function ( key, data, onResult ) {
	var args = helper.fixupArgs( key, data, onResult );
};
/*
 * Same as thing.POST( "thing/new" )
 * result = thing.NEW( data );
 */
module.exports.NEW = function ( key, data, onResult ) {
	var args = helper.fixupArgs( key, data, onResult );
};
/*
 * Same as thing.POST( "thing/new" )
 * result = thing.NEW( data );
 */
module.exports.DO = function ( action, data, onResult ) {
};
