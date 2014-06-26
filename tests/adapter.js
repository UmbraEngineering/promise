
var Promise = require('../lib').Promise;

exports.resolved = Promise.resolve;
exports.rejected = Promise.reject;
exports.deferred = function() {
	var deferred = { };
	
	deferred.promise = new Promise(function(resolve, reject) {
		deferred.resolve = resolve;
		deferred.reject = reject;
	});

	return deferred;
};
