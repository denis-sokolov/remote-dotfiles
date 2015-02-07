'use strict';

var is = require('is');
var Vinyl = require('vinyl');

var contents = function(servers, proxies, custom, target){

	return (servers || []).filter(function(server){
		return server.alias !== target.alias;
	}).map(function(server){
		var rules = [];

		if (server.alias !== server.host)
			rules.push('HostName ' + server.host);

		if (server.port)
			rules.push('Port ' + server.port);

		var proxy = proxies && proxies(target, server);
		if (proxy && proxy !== target.alias)
			rules.push('ProxyCommand ssh ' + proxy + ' -W %h:%p 2>/dev/null');

		return 'Host ' + server.alias + '\n' +
			rules.map(function(rule){ return '\t' + rule + '\n'; }).join('');
	}).join('\n') + 'Host *\n' + (custom || '') + '\n';
};

module.exports = function(util, app){
	var custom = util.setting(app, 'ssh', is.string);
	var proxies = util.setting(app, 'proxies', is.function);

	return function(stream, servers, target){
		if (!servers && !custom()) return;

		stream.push(new Vinyl({
			path: '.ssh/config',
			contents: new Buffer(contents(servers, proxies(), custom(), target))
		}));
	};
};
