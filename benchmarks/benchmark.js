'use strict';

var _ = require('lodash');
var async = require('async');
var Benchmark = require('benchmark');
var httpApi = require('./http');
var suite = new Benchmark.Suite('httpApi');
var program = require('commander');

var chain = {};
var endpoints = {};

// Get comman line args
program
    .option('-s, --suite <name>', 'suite for benchmark: http')
    .option('-r, --range <name>', 'benchmarks range: all, ui, explorer')
    .parse(process.argv);

// Set default values for command line args
program.suite = program.suite || 'http';
program.range = program.range || 'all';

// Define config for benchmarked endpoints
function defineBenchmarkConfig () {
	endpoints.http = {
		'blocks ~> get last block':
			{function: httpApi.blocks.get, params: ['limit=1', 'orderBy=height:desc'], usage: ['ui', 'explorer']},
		'blocks ~> get blocks with largest possible offset':
			{function: httpApi.blocks.get, params: ['offset=' + chain.height], usage: []},
	};
}

// Collect live data used in benchmarks
async.series([
    function (cb) {
		httpApi.init.getHeight(function (err, res) {
			chain.height = Number(res);
			cb();
		});
    },
    function (cb) {
		httpApi.init.getDelegateWithMostForgedBlocks(function (err, res) {
			chain.delegate = res;
			cb();
		});
    }
],
function (err, results) {
	// Define config for benchmarked endpoints
	defineBenchmarkConfig();

	// Add tested endpoints to suite
	if (program.suite === 'http') {
		_.each(endpoints.http, function (options, name) {
			if (program.range === 'all' || _.includes(options.usage, program.range)) {
				suite.add(name, function (defer) {
					return options.function(defer, options.params);
				}, {defer: true});
			}
		});
	}

	// Execute benchmark suite
    console.log('Running ' + program.range + ' benchmarks for ' + program.suite + ' endpoints...');
	suite.run({ 'async': false });
});

suite.on('cycle', function (event) {
   console.log(String(event.target));
})
.on('complete', function () {
   console.log('Slowest endpoint is ' + this.filter('slowest').map('name'));
   console.log('Fastest endpoint is ' + this.filter('fastest').map('name'));
   console.log('Benchmark completed');
});
