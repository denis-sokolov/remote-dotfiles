'use strict';

var is = require('is');
var Promise = require('promise');
var readonly = require('read-only-stream');
var through2 = require('through2');

var bashFactory = require('./bash');
var customFactory = require('./custom');
var deploy = require('./deploy');
var pretty = require('./pretty');
var sshFactory = require('./ssh');
var util = require('./util');

var normalize = function(servers){
	return servers && servers.map(function(server){
		server.alias = server.alias || server.host;
		return server;
	}).sort(function(a, b){
		return a.alias.localeCompare(b.alias);
	});
};

var api = function(){
	var app = {};

	var bash = bashFactory(util, app);
	var custom = customFactory(util, app);
	var ssh = sshFactory(util, app);
	var servers = util.setting(app, 'servers', is.array);

	app.deploy = deploy.bind(null, util, app, servers);

	app.stream = function(targetAlias){
		var stream = through2.obj();
		var target = {};
		var srvs = normalize(servers());

		if (srvs && targetAlias) {
			var targets = srvs.filter(function(s){ return s.alias === targetAlias; });
			if (targets.length === 0)
				throw new Error('Unrecognized targetAlias');
			target = targets[0];
		}

		Promise.all([
			bash(stream, target),
			custom(stream),
			ssh(stream, srvs, target)
		]).then(function(){
			stream.end();
		});

		return readonly(stream);
	};

	return app;
};


api.pretty = pretty;

module.exports = api;
