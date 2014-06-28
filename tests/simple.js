
var Promise = require('../lib').Promise;

Promise.resolve('foo').then(function(value) {
	console.log(value);
});

// --------------------------------------------------------

var promise1 = new Promise(function(resolve, reject) {
	setTimeout(function() {
		resolve('bar');
	}, 100);
});

promise1.then(function(value) {
	console.log(value);
});

promise1.then(function(value) {
	console.log(value + '2');
});

// --------------------------------------------------------

var promise2 = new Promise(function(resolve, reject) {
	setTimeout(function() {
		reject('baz');
	}, 100);
});

promise2.then(function() { console.log('resolve'); });
promise2.catch(function(value) { console.log('reject1' + value); });
promise2.then(null, function(value) { console.log('reject2' + value); });

// --------------------------------------------------------

var promise3 = new Promise(function(resolve) {
	setTimeout(function() { resolve('qux1'); }, 100);
});

promise3
	.then(function(value) {
		console.log(value);
		return 'qux2';
	})
	.then(function(value) {
		console.log(value);
		return Promise.resolve('qux3');
	})
	.then(function(value) {
		console.log(value);
	});


