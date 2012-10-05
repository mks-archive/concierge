/**
 * Concierge - A Node.js solution for using code-on-demand for a RESTful server.
 *
 * @type {Number}
 * @private
 */
var _code = 0;
function getDefaultResult() {
	return {
		code:0,
		message:"",
		status:"success",
		data:{} }
}
function getHttpStatusMesssage( code ) {
	var codes = {
		"200": "Ok",
		"301": "Moved Permenantly",
		"302": "Found",
		"404": "Not Found"
	};
	/**
	 * See: http://www.devthought.com/2012/01/18/an-object-is-not-a-hash/
	 * See: http://stackoverflow.com/a/1830844/102699
	 */
	return isNumeric(code) && codes[code] ? codes[code] :  "Unknown [status="+code+"]";
}
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
exports.host = null;
exports.headers = [];
exports.result = getDefaultResult();
exports.path = null;
exports.query = null;
exports.key = null;
exports.data = null;
exports.__fixup = function(request,response) {
	this.path = request.url;
	this.host = request.headers.host;
}
function fixupArgs( thing, key, data, callback ) {
	if ( typeof key == 'function' ) {
		callback = key;
		key = {};
		data = {};
	} else if ( typeof key != 'object' ) {
		key = {key:key};
		if ( typeof data == 'function' ) {
			callback = data;
			data = {};
		}
	}
	return {
		thing: 		thing,
		key: 			key,
		data: 		data,
		callback:	callback
	}
}
/*
 * obj = $api.GET( "thing", key, data );
 * newobj = obj.GET( "another_thing", key, data );
 */
exports.GET = function ( thing, key, data, callback ) {
	var args = fixupArgs( thing, key, data, callback );
};
/*
 * result = obj.PUT( "thing", data );
 * result = api.PUT( "thing", key, data );
 */
exports.PUT = function ( thing, key, data, callback ) {
	var args = fixupArgs( thing, key, data, callback );
}
/*
 * result = obj.POST( "thing", data );
 * result = api.POST( "thing", key, data );
 */
exports.POST = function ( thing, key, data, callback ) {
	var args = fixupArgs( thing, key, data, callback );
}
/*
 * result = obj.DELETE( "thing" );
 * result = api.DELETE( "thing", key );
 */
exports.DELETE = function ( thing, key, data, callback ) {
	var args = fixupArgs( thing, key, data, callback );
}
/*
 * result = obj.PATCH( "thing", data );
 * result = api.PATCH( "thing", key, data );
 */
exports.PATCH = function ( thing, key, data, callback ) {
	var args = fixupArgs( thing, key, data, callback );
}
/*
 * Same as api.POST( "thing/new" )
 * result = api.NEW( "thing", data );
 * result = api.NEW( "thing", data );
 */
exports.NEW = function ( thing, key, data, callback ) {
	var args = fixupArgs( thing, key, data, callback );
};
/*
 * Set HTTP status code
 */
exports.code = function( code ) {
	_code = code;
	this.result = getDefaultResult();
	this.result.code = code;
	this.result.message = getHttpStatusMesssage( code );
	return code;
};
/*
 * Set HTTP status code
 */
exports.location = function( uri, code ) {
	this.header( "Location", uri );
	this.code( code );
};
/*
 * Set HTTP status code
 */
exports.header = function( name, value ) {
	this.headers.push( name + ": " + value );
};
