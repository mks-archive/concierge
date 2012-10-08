
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

module.exports.getHttpStatusMesssage = function( code ) {
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
};

/**
 * Allow args to GET, PUT, POST, DELETE, PATCH and NEW to be:
 *
 * 		(thing,key), (thing,key,data), (thing,key,data,callback), (thing,data), (thing,data,callback) or (thing,callback)
 *
 * @param key
 * @param data
 * @param callback
 * @return {Object}
 */
module.exports.fixupArgs = function( thing, key, data, callback ) {
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
		thing:	  thing,
		key: 			key,
		data: 		data,
		callback:	callback
	}
};
