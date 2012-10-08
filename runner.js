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
exports.run = function($api, api, script) {
	"use strict";

	var result = '';
//	var error = checkForSyntaxError(jsCode);
	var error = null;

	if (!error) {
		try {
			if ('127.0.0.1' == $api.host) {
				result = eval(script);
			} else {
				result = vm.runInNewContext(jsCode, {"$api": $api}).toString();
			}
		} catch (error) {
			console.log( 'JAVASCRIPT SYNTAX ERROR: ');
			console.log( error );
			$api.out('ERROR, see console log.' );
		}
	}
	return result;
}
