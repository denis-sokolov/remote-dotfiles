'use strict';

var path = require('path');

var mapStream = require('map-stream');
var Promise = require('promise');

var removeExt = function(p){
	return p.substring(0, p.length - path.extname(p).length);
};

module.exports = function(util, app){
	var bin = util.settings(app, 'bin');
	var sources = util.settings(app, 'bash');

	return function(stream, target){
		return new Promise(function(resolve){
			if (!sources() && !bin())
				return resolve();

			var waitFor = [];

			var srces = sources() || [];

			if (bin()) {
				// Force .bashrc to be created
				srces.push('');

				waitFor.push(new Promise(function(resolveInner){
					util.src(bin(), target)
						.pipe(util.rename(function(name){
							return '.bin/' + removeExt(name);
						}))
						.pipe(mapStream(function(file, done){
							file.executable = true;
							done(null, file);
						}))
						.pipe(stream, {end: false})
						.on('end', function(){
							resolveInner();
						});
				}));
			}

			var ours = util.src(srces, target)
				.pipe(util.concat('.bashrc'))
				.pipe(util.comment.stream('# ', 'Use .bashrc.local for editing'))
				.pipe(util.append('[ -f .bashrc.local ] && . .bashrc.local'));

			if (bin())
				ours = ours.pipe(util.append('export PATH=".bin:$PATH"'));

			ours.pipe(stream, {end: false});
			ours.on('end', function(){
				Promise.all(waitFor).then(resolve);
			});
		});
	};
};
