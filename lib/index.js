
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
// State constants
// 
var PENDING    = void(0);
var SEALED     = 0;
var FULFILLED  = 1;
var REJECTED   = 2;

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

	var self = this;

	// The queue of functions waiting for the promise to resolve/reject
	utils.defineProperty(this, 'funcs', {
		enumerable: false,
		configurable: false,
		writable: false,
		value: [ ]
	});

	// The queue of functions waiting for the promise to resolve/reject
	utils.defineProperty(this, 'value', {
		enumerable: false,
		configurable: true,
		writable: false,
		value: void(0)
	});

	// Call the function, passing in the resolve and reject functions
	try {
		callback(resolve, reject);
	} catch (err) {
		reject(err);
	}

	// The {resolve} callback given to the handler function
	function resolve(value) {
		resolvePromise(self, value);
	}

	// The {reject} callback given to the handler function
	function reject(value) {
		rejectPromise(self, value);
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
	var self = this;

	// Create the new promise that will be returned
	var promise = new Promise(function( ) { });

	// Add the functions to the list
	this.funcs.push(promise,
		function(value) {
			resolvePromise(promise, value);
		},
		function(value) {
			rejectPromise(promise, value);
		}
	);

	return promise;
};

// 
// Assigns a handler function for the reject event
// 
// @param {onReject} a function called when the promise rejects
// @return Promise
// 
Promise.prototype.catch = function(onReject) {
	return this.then(null, onReject);
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

// 
// Returns a new promise which resolve/rejects as soon as the first given promise resolves
// or rejects
// 
// @param {promises} an array of promises
// @return Promise
// 
Promise.race = function(promises) {
	var promise = new Promise(function() { });

	promises.forEach(function(childPromise) {
		childPromise.then(
			function(value) {
				resolvePromise(promise, value);
			},
			function(value) {
				rejectPromise(promise, value);
			}
		);
	});

	return promise;
};

// --------------------------------------------------------

// 
// Resolve the given promise
// 
// @param {promise} the promise to resolve
// @param {value} the value of the promise
// @return void
// 
function resolvePromise(promise, value) {
	startCompletion(promise, FULFILLED, value);
}

// 
// Reject the given promise
// 
// @param {promise} the promise to reject
// @param {value} the value of the promise
// @return void
// 
function rejectPromise(promise, value) {
	startCompletion(promise, REJECTED, value);
}

// 
// Start the process of resolving/rejecting the promise
// 
// @param {promise} the promise to resolve/reject
// @param {state} the state to set (FULFILLED or REJECTED)
// @param {value} the value of the promise
// @return void
// 
function startCompletion(promise, state, value) {
	if (promise.state !== PENDING) {return;}

	setValue(value);
	setState(SEALED);

	setImmediate(function() {
		setState(state);
		invokeFunctions(promise);
	});
}

// 
// Set the state of a promise
// 
// @param {promise} the promise to modify
// @param {state} the new state
// @return void
// 
function setState(promise, state) {
	utils.defineProperty(promise, 'state', {
		enumerable: false,
		// According to the spec: If the state is PENDING (void) or SEALED (0), the state can be changed;
		// If the state is FULFILLED (1) or REJECTED (2), the state cannot be changed, and therefore we
		// lock the property
		configurable: (! state),
		writable: false
	});
}

// 
// Set the value of a promise
// 
// @param {promise} the promise to modify
// @param {value} the value to store
// @return void
// 
function setValue(promise, value) {
	utils.defineProperty(promise, 'value', {
		enumerable: false,
		configurable: false,
		writable: false,
		value: value
	});
}

// 
// Invoke all existing functions queued up on the promise
// 
// @param {promise} the promise to run functions for
// @return void
// 
function invokeFunctions(promise) {
	var funcs = promise.funcs;

	for (var i = 0, c = funcs.length; i < c; i += 3) {
		invokeFunction(promise, funcs[i], funcs[i + promise.state]);
	}

	// Empty out this list of functions as no one function will be called
	// more than once, and we don't want to hold them in memory longer than needed
	promise.funcs.length = 0;
}

// 
// Invoke one specific function for the promise
// 
function invokeFunction(promise, child, func) {
	var value, error;
	var success = true;
	var isFunc = (typeof func === 'function');

	// If we have a function to run, run it
	if (isFunc) {
		try {
			value = func(promise.value);
		} catch (err) {
			error = err;
			success = false;
		}
	}

	// Otherwise, just keep on moving with the value we already have
	else {
		value = promise.value;
	}

	// If the value is a thenable, use it
	if (handleThenable(child, value)) {
		return;
	}

	// If there was a function, and it succeeded, resolve
	else if (isFunc && success) {
		resolvePromise(child, value);
	}

	// If there was any kind of failure, reject
	else if (! success) {
		rejectPromise(child, value);
	}

	// If none of the above happened, just use the previous state
	else if (promise.state === FULFILLED) {
		resolvePromise(child, value);
	} else if (promise.state === REJECTED) {
		rejectPromise(child, value);
	}
}

// 
// When a promise resolves with another thenable, this function handles delegating control
// and passing around values
// 
// @param {child} the child promise that values will be passed to
// @param {value} the thenable value from the previous promise
// @return boolean
// 
function handleThenable(child, value) {
	var done;

	if (utils.isThenable(value)) {
		try {
			value.then.call(value,
				function(subValue) {
					// Make sure to only handle it once
					if (done) {return true;}
					done = true;

					resolvePromise(child, subValue);
				},
				function(subValue) {
					// Make sure to only handle it once
					if (done) {return true;}
					done = true;
					
					rejectPromise(child, subValue);
				}
			);
		} catch (err) {
			if (done) {return true;}
			resolved = done;

			rejectPromise(child, err);
		}
	}

	return false;
}
