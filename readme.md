
# Promise

An ES6 Promise polyfill.

[![Build Status](https://travis-ci.org/UmbraEngineering/promise.svg?branch=master)](https://travis-ci.org/UmbraEngineering/promise)

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

# Running tests

We rely on [promises-aplus-tests](https://github.com/promises-aplus/promises-tests) for unit testing. The tests can be run with the following:

```bash
$ npm install
$ npm test
```
