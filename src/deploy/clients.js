'use strict';

/**
 * This file is ignored for code coverage because it consists of touching
 * real FS and SSH.
 */

var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');

var mkdirp = require('mkdirp');
var quote = require('shell-quote').quote;
var Promise = require('promise');

/* istanbul ignore next */
var childError = function(code, stderr){
	var e = new Error(stderr);
	e.code = code;
	return e;
};

var api = {};

/* istanbul ignore next */
api.fs = function(directory){
	return {
		read: function(filepath){
			return Promise.denodeify(fs.readFile)(path.join(directory, filepath));
		},
		write: function(filepath, data){
			var fileAbsPath = path.join(directory, filepath);
			var dirpath = path.dirname(fileAbsPath);
			return Promise.denodeify(mkdirp)(dirpath).then(function(){
				return Promise.denodeify(fs.writeFile)(fileAbsPath, data);
			});
		}
	};
};

/* istanbul ignore next */
api.ssh = function(server){
	return {
		read: function(filepath){
			return new Promise(function(resolve, reject){
				var read = spawn('ssh', [server, quote(['cat', filepath])]);
				var stdout = '';
				var stderr = '';
				read.stdout.on('data', function(data){ stdout += data; });
				read.stderr.on('data', function(data){ stderr += data; });
				read.on('close', function(code){
					if (code === 0) {
						resolve(stdout);
					} else {
						reject(childError(code, stderr));
					}
				});
			});
		},
		write: function(filepath, filecontents){
			return new Promise(function(resolve, reject){
				var remoteCommand = ['cat', '>', filepath];
				if (filepath.indexOf('/') > -1) {
					remoteCommand = ['mkdir', '-p', path.dirname(filepath), '&&']
						.concat(remoteCommand);
				}
				var write = spawn('ssh', [server, quote(remoteCommand)]);
				var stdout = '';
				var stderr = '';
				write.stdin.write(filecontents);
				write.stdin.end();
				write.stdout.on('data', function(data){ stdout += data; });
				write.stderr.on('data', function(data){ stderr += data; });
				write.on('close', function(code){
					if (code === 0) {
						resolve(stdout);
					} else {
						reject(childError(code, stderr));
					}
				});
			});
		}
	};
};

module.exports = api;
