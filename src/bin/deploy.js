'use strict';
/* eslint-disable no-console */

var path = require('path');

module.exports = function(args){
	var app = require(path.resolve(args.configuration));

	var f;
	if (args.target === 'local')
		f = app.deploy.local.bind(app.deploy);
	else {
		var options = {
			parallelLimit: 3
		};
		if (args.target !== 'all')
			options.target = args.target;
		f = app.deploy.bind(null, options);
	}

	f().then(null, function(err){
		/* eslint-disable no-process-exit */
		setTimeout(() => { throw err; });
	});
};
