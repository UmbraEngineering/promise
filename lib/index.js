
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

// 
// Returns an immediately resolving promise which resolves with {value}
// 
// @param {value} the value to resolve with
// @return Promise
// 
Promise.resolve = function(value) {
	// If {value} is a promise, return it
	if (value && value instanceof Promise) {
		return value;
	}

	// Otherwise, create a new promise to return
	return new Promise(function(resolve) {
		resolve(value);
	});
};
