'use strict';

var node = require('./../node.js');

function Blocks () {
	this.get = function (deferred, args) {
		node.get('/api/blocks?' + args.join('&'), function (err, res) {
			if (err) { throw Error(err); }
			deferred.resolve();
		});
	};
};

module.exports = new Blocks;
