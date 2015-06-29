'use strict';
/* eslint-disable no-console */

var path = require('path');

module.exports = function(args){
	var app = require(path.resolve(args.configuration));

	var f;
	if (args.target === 'local')
		f = app.deploy.local.bind(app.deploy);
	else if (args.target === 'all')
		f = app.deploy.bind(null, {parallelLimit: 3});
	else
		throw new Error('Unknown target');

	f().then(null, function(err){
		/* eslint-disable no-process-exit */
		console.log(err);
		process.exit(1);
	});
};
