
var utils = require('./utils');

// Get a reference to the global scope. We do this instead of using {global}
// in case someone decides to bundle this up and use it in the browser
var _global = (function() { return this; }).call();

// 
// Install the Promise constructor into the global scope, if and only if a
// native promise constructor does not exist.
// 
exports.install = function() {
	if (! _global.Promise) {
		_global.Promise = Promise;
	}
};

// 
// Remove global.Promise, but only if it is our version
// 
exports.uninstall = function() {
	if (_global.Promise && _global.Promise === Promise) {
		_global.Promise = void(0);
		delete _global.Promise;
	}
};

// 
// The Promise constructor
// 
// @param {callback} the callback that defines the process to occur
// 
var Promise = exports.Promise = function(callback) {
	// Check that a function argument was given
	if (typeof callback !== 'function') {
		throw new TypeError('Promise constructor takes a function argument');
	}

	// Check that a new instance was created, and not just a function call was made
	if (! (this instanceof Promise)) {
		throw new TypeError('Failed to construct \'Promise\': Please use the \'new\' operator, this object constructor cannot be called as a function.');
	}

	// The queue of functions waiting for the promise to resolve/reject
	this._functions = [ ];

	// Call the function, passing in the resolve and reject functions
	try {
		callback(resolve, reject);
	} catch (err) {
		reject(err);
	}

	// The {resolve} callback given to the handler function
	function resolve(value) {
		// 
	}

	// The {reject} callback given to the handler function
	function reject(value) {
		// 
	}
};

// --------------------------------------------------------

// 
// Assigns handler function(s) for the resolve/reject events
// 
// @param {onResolve} optional; a function called when the promise resolves
// @param {onReject} optional; a function called when the promise rejects
// @return Promise
// 
Promise.prototype.then = function(onResolve, onReject) {
	// 
};

// 
// Assigns a handler function for the reject event
// 
// @param {onReject} a function called when the promise rejects
// @return Promise
// 
Promise.prototype.catch = function(onReject) {
	// 
};

// --------------------------------------------------------

// 
// Returns an immediately resolving promise which resolves with {value}. If {value} is
// a thenable, the new promise will instead follow the given thenable.
// 
// @param {value} the value to resolve with
// @return Promise
// 
Promise.resolve = function(value) {
	var callback = (utils.isThenable(value)
		? function(resolve, reject) {
			value.then(resolve, reject);
		}
		: function(resolve) {
			resolve(value);
		}
	);

	return new Promise(callback);
};

// 
// Returns an immediately rejected promise
// 
// @param {reason} the reason for the rejection
// @return Promise
// 
Promise.reject = function(reason) {
	return new Promise(function(resolve, reject) {
		reject(reason);
	});
};

// 
// Returns a new promise which resolves/rejects based on an array of given promises
// 
// @param {promises} the promises to handle
// @return Promise
// 
Promise.all = function(promises) {
	return new Promise(function(resolve, reject) {
		if (! Array.isArray(promises)) {
			resolve([ ]);
			return;
		}

		var values = [ ];
		var finished = false;
		var remaining = promises.length;
		
		promises.forEach(function(promise, index) {
			if (! utils.isThenable(promise)) {
				onResolve(promise);
				return;
			}

			promise.then(onResolve);
			promise.catch(function(reason) {
				finished = true;
				reject(reason);
			});

			function onResolve(value) {
				remaining--;
				values[index] = value;
				checkIfFinished();
			}
		});

		function checkIfFinished() {
			if (! finished && ! remaining) {
				finished = true;
				resolve(values);
			}
		}
	});
};
