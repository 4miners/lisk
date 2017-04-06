'use strict';

var _ = require('lodash');
var node = require('./../node.js');

function Init () {
	this.getHeight = function (cb) {
		node.get('/api/blocks/getHeight', function (err, res) {
			if (res && res.body && res.body.height) {
				return cb (null, res.body.height);
			} else {
				console.error('Failed to blockchain height');
				throw Error(err || res.body.error);
			}
		});
	};

	this.getDelegateWithMostForgedBlocks = function (cb) {
		node.get('/api/delegates', function (err, res) {
			if (res && res.body && res.body.delegates) {
				var bestDelegate = _.sortBy(res.body.delegates, 'producedblocks').reverse()[0];
				return cb (null, bestDelegate);
			} else {
				console.error('Failed to get delegate with most forged blocks');
				throw Error(err || res.body.error);
			}
		});
	};
};

module.exports = new Init;
