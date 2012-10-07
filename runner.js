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
exports.run = function($api, apiName, jsCode) {
	"use strict";

	var result = '';
//	var error = checkForSyntaxError(jsCode);
	var error = null;

	if (error) {
		result = 'JAVASCRIPT SYNTAX ERROR[' + apiName +']: ' + error;
	} else {
		try {
			if ('127.0.0.1' == $api.host) {
				result = eval(jsCode);
			} else {
				result = vm.runInNewContext(jsCode, {"$api": $api}).toString();
			}
		} catch (error) {
			$api.end(result = 'JAVASCRIPT RUNTIME ERROR[' + apiName +']: ' + error.type);
		}
	}
	return result;
}
