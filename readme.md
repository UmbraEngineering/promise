
# Promise

An ES6 Promise polyfill.

# Install

```bash
$ npm install [--save] promise-es6
```

# Usage

```javascript
// Load for use in this one place ...
var Promise = require('promise-es6').Promise;

// ... or make a global polyfill
require('promise-es6').install();
```

# Notes for browser use

This module is designed for use in a Node.js environment, but could theoretically be used in the browser (even though there is no existing support for this). This is just a list of notes to help if anyone attempts to make this browser friendly.

* The `promise.install/uninstall` methods already correctly determine the global object, whether in Node.js or the browser, by using `.call()` with no params.
* There are use of the following methods that may or may not be available in all browsers.
    * Array.prototype.forEach
    * Array.isArray

