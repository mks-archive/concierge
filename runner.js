var checkForSyntaxError = require('syntax-error');
var vm = require("vm");

/**
 * http://nodejs.org/api/vm.html
 * http://izs.me/v8-docs/classv8_1_1Context.html#_details
 * https://github.com/substack/node-syntax-error
 * See also:
 * 	https://github.com/substack/node-burrito
 * 	https://npmjs.org/package/funex
 *
 */
exports.run = function(concierge, code) {
	"use strict";

	var result = '';
	var error = checkForSyntaxError(code);

	if (error) {
		result = 'JAVASCRIPT SYNTAX ERROR: ' + error;
	} else {
		try {
			if (concierge.host.indexOf('127.0.0.1:') == 0) {
				var api = concierge;
				
				result = eval(code);
			} else {
				result = vm.runInNewContext(code, {"$api": concierge}).toString();
			}
		} catch (error) {
			result = "JAVASCRIPT RUNTIME ERROR: " + error.type;
		}
	}
	return result;
}

///**
// * https://npmjs.org/package/contextify
// * https://github.com/brianmcd/contextify/blob/master/README.md
// */
//exports.run = function( $api,code ) {
//	"use strict";
//	//global.process = null; // global.process allows some bad juju.
//	var result;
//	try {
//		var Contextify = require('contextify');
//		var sandbox = { "$api" : $api };
//		Contextify(sandbox);
//		result = sandbox.run(code);
//		sandbox.dispose(); // free the resources allocated for the context.
//	} catch (err) {
//		result = "ERROR: " + err.type;
//	}
//	return result.toString();
//}
