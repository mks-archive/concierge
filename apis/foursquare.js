/**
 * Concierge for Foursquare v2 API
 * VERY PRELIMINARY, only covers one (1) of probably 100 services.
 */

var date = '20121006';  // Date we coded this so we no the 4sq API worked on that date.

module.exports.protocol = 'https';

module.exports.version = '0.0';

module.exports.credentials = {};

module.exports.service = {
	host: 'api.foursquare.com',
	port: 443,
	path: '/v2',
	headers: {'Content-Type': 'application/json'}
};

module.exports.actions = {
};

module.exports.links = {
	'venue-categories': {
		path: 'venues/categories',
		access: 'app' // vs. 'user'
	}
};

module.exports.filterOutput = function(output) {
	this.code(output.meta.code);
	return output;
}
module.exports.onServiceInit = function(service){
	var auth = this.credentials;
	service.path += '?client_id=' + auth.client_id + '&client_secret=' + auth.client_secret + '&v=' + date;
};

