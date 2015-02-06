'use strict';

var Promise = require('promise');
var vinylFs = require('vinyl-fs');

module.exports = function(util, app){
	var globs = util.settings(app, 'bash');

	return function(stream){
		return new Promise(function(resolve){
			if (!globs())
				return resolve();

			var ours = vinylFs.src.apply(vinylFs, globs())
				.pipe(util.concat('.bashrc'))
				.pipe(util.comment('#', 'Use .bashrc.local for editing'))
				.pipe(util.append('. .bashrc.local'));
			ours.pipe(stream, {end: false});
			ours.on('end', function(){
				resolve();
			});
		});
	};
};
