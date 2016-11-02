'use strict';

/**
 * This file is ignored for code coverage because it consists of touching
 * real FS and SSH.
 */

var childProcess = require('child_process');
var fs = require('fs');
var path = require('path');

var mkdirp = require('mkdirp');
var quote = require('shell-quote').quote;
var Promise = require('promise');

/* istanbul ignore next */
var run = function(args, opts){
	opts = opts || {};
	return new Promise(function(resolve, reject){
		var process = childProcess.spawn.apply(null, args);
		var stdout = '';
		var stderr = '';
		if (opts.stdin) {
			process.stdin.write(opts.stdin);
			process.stdin.end();
		}
		process.stdout.on('data', function(data){ stdout += data; });
		process.stderr.on('data', function(data){ stderr += data; });
		process.on('close', function(code){
			if (code === 0) {
				resolve(stdout);
			} else {
				var e = new Error(args.join(' ') + ' failed: ' + stderr);
				e.code = code;
				reject(e);
			}
		});
	});
};

var api = {};

/* istanbul ignore next */
api.fs = function(directory){
	return {
		makeExecutable: function(filepath){
			return Promise.denodeify(fs.chmod)(
				path.join(directory, filepath),
				parseInt('0755', 8)
			);
		},
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
		makeExecutable: function(filepath){
			return run(['ssh', [server, quote(['chmod', '+x', filepath])]]);
		},
		read: function(filepath){
			return run(['ssh', [server, quote(['cat', filepath])]]);
		},
		write: function(filepath, filecontents){
			if (!filecontents)
				throw new Error('Provide file contents');
			var remoteCommand = ['cat', '>', quote([filepath])];
			if (filepath.indexOf('/') > -1) {
				remoteCommand = ['mkdir', '-p', quote([path.dirname(filepath)]), '&&']
					.concat(remoteCommand);
			}
			return run(['ssh', [server].concat(remoteCommand)], {
				stdin: filecontents
			});
		}
	};
};

module.exports = api;
