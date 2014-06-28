
var _global = (function() { return this; }).call();

// 
// Returns true iff value is an object and has a .then method
// 
exports.isThenable = function(value) {
	return (value && typeof value === 'object' && typeof value.then === 'function');
};

// 
// Shim Object.defineProperty if needed; This will never run in Node.js land, but
// is here for when we browserify
// 
exports.defineProperty = function(obj, prop, opts) {
	if (Object.defineProperty) {
		try {
			return Object.defineProperty(obj, prop, opts);
		} catch (err) { }
	}
	
	if (opts.value) {
		obj[prop] = opts.value;
	}
};

// 
// setImmediate shim
// 
if (! _global.setImmediate) {
	_global.setImmediate = function(func) {
		setTimeout(func, 0);
	};
}

exports.log = function(obj) {
	console.log(
		require('util').inspect(obj, {
			colors: true,
			showHidden: true,
			depth: 2
		})
	)
};
