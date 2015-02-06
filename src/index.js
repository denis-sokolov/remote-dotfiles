'use strict';

var Promise = require('promise');
var readonly = require('read-only-stream');
var through2 = require('through2');

var bashFactory = require('./bash');
var sshFactory = require('./ssh');
var util = require('./util');


module.exports = function(){
	var app = {};

	var bash = bashFactory(util, app);
	var ssh = sshFactory(util, app);

	app.stream = function(target){
		var stream = through2.obj();

		Promise.all([
			bash(stream, target),
			ssh(stream, target)
		]).then(function(){
			stream.end();
		});

		return readonly(stream);
	};

	return app;
};
