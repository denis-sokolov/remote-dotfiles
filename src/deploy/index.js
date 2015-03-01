'use strict';

var cli = require('cli');
var Promise = require('promise');
var through2 = require('through2');

var clients = require('./clients');

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
				cb(null, file);
			}, cb);
	});
};

var deploy = function(stream, client){
	return new Promise(function(resolve, reject){
		stream
			.pipe(backup(client, 'remote-dotfiles')).on('error', reject)
			.pipe(dest(client)).on('error', reject)
			.on('data', function(){})
			.on('end', function(){
				resolve();
			});
	});
};

var local = function(app){
	return deploy(app.stream(), clients.fs(process.env.HOME));
};

module.exports = function(util, app, servers, progress){
	var step = util.progress(servers().length + 1, progress || cli.progress);
	return local(app).then(function(){
		step();
		return Promise.all(servers().map(function(srv){
			return deploy(app.stream(srv.alias), clients.ssh(srv.alias))
				.then(step);
		}));
	});
};

module.exports.local = local;
