module.exports.demoApiName = null;

module.exports.loadCredentials = function( appName ) {
	return require('./examples/'+appName+'/credentials');
};
module.exports.loadExampleCode = function(appName,service) {
	return require('fs').readFileSync('./examples/'+appName+'/'+service+'.js').toString().trim();
};
