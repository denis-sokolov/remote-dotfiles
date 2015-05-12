'use strict';

var async = require('async');
var cli = require('cli');
var Promise = require('promise');
var through2 = require('through2');

var clients = require('./clients');


/**
 * Ignored statements in this function refer to the portions of the source code
 * that deal with such options combinations that do not allow for fake clients
 * to be injected.
 */
var deployOptions = function(options){
	/* istanbul ignore if */
	if (typeof options === 'function')
		options = { progress: options };
	/* istanbul ignore next */
	options = options || {};
	/* istanbul ignore next */
	options.progress = options.progress || cli.progress;
	/* istanbul ignore next */
	options.clients = options.clients || {};
	if (options.clients.read || typeof options.clients === 'function')
		options.clients = {
			fs: options.clients,
			ssh: options.clients
		};
	/* istanbul ignore next */
	options.clients.fs = options.clients.fs || clients.fs;
	/* istanbul ignore next */
	options.clients.ssh = options.clients.ssh || clients.ssh;
	if (typeof options.clients.fs !== 'function')
		options.clients.fs = (function(value){
			return function(){ return value; };
		})(options.clients.fs);
	if (typeof options.clients.ssh !== 'function')
		options.clients.ssh = (function(value){
			return function(){ return value; };
		})(options.clients.ssh);
	options.parallelLimit = options.parallelLimit || 10;
	return options;
};

var backup = function(client, tag){
	return through2.obj(function(file, enc, cb){
		var filepath = file.relative;
		client.read(filepath)
			.then(function(data){
				if (data.toString().indexOf(tag) < 0) {
					return client.write(filepath + '.orig.' + tag, data);
				}
			})
			.catch(function(err){
				if (err.message.indexOf('ENOENT') < -1)
					throw err;
			})
			.then(function(){
				cb(null, file);
			})
			.catch(cb);
	});
};

var dest = function(client){
	return through2.obj(function(file, enc, cb){
		client.write(file.relative, file.contents)
			.then(function(){
				if (file.executable) {
					return client.makeExecutable(file.relative);
				}
			}, cb)
			.then(function(){
				cb(null, file);
			}, cb);
	});
};

var deploy = function(stream, client){
	return new Promise(function(resolve, reject){
		stream
			.on('error', reject)
			.pipe(backup(client, 'remote-dotfiles')).on('error', reject)
			.pipe(dest(client)).on('error', reject)
			.on('data', function(){})
			.on('end', function(){
				resolve();
			});
	});
};

var local = function(app, options){
	options = deployOptions(options);
	return deploy(app.stream(), options.clients.fs(process.env.HOME));
};

/**
 * Options can be a function as a shortcut for progress or a full object:
 * {
 *   progress: function(progress){}
 * }
 *
 *
 * FS and SSH behavior can be modified with an unsupported option "clients".
 *
 * Simple use:
 * {
 *   clients: {
 *     read: function(filepath){ return Promise.resolve(data); },
 *     write: function(filepath, data){ return Promise.resolve(); }
 *   }
 * }
 *
 * Separate FS and SSH behavior:
 * {
 *   clients: {
 *     fs: { read, write },
 *     ssh: { read, write }
 *   }
 * }
 *
 * Constructors with more options:
 * {
 *   clients: {
 *     fs: function(basedir){ return { read, write }; },
 *     ssh: function(serverAlias){ return { read, write }; }
 *   }
 * }
 */
module.exports = function(util, app, servers, options){
	options = deployOptions(options);
	var srvs = servers() || [];

	var step = util.progress(srvs.length + 1, options.progress);
	return local(app, options).then(function(){
		step();
		return Promise.denodeify(async.parallelLimit)(srvs.map(function(srv){
			return Promise.nodeify(function(){
				return deploy(app.stream(srv.alias), options.clients.ssh(srv.alias))
					.then(step);
			});
		}), options.parallelLimit);
	});
};

module.exports.local = local;
