
// 
// Returns true iff value is an object and has a .then method
// 
exports.isThenable = function(value) {
	return (value && typeof value === 'object' && typeof value.then === 'function');
};
