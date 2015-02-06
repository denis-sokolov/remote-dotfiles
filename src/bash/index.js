'use strict';

var vinylFs = require('vinyl-fs');

module.exports = function(util, app){
	var globs = util.settings(app, 'bash');

	return function(stream){
		if (!globs()) return;
		vinylFs.src.apply(vinylFs, globs())
			.pipe(util.concat('.bashrc'))
			.pipe(util.comment('#', 'Use .bashrc.local for editing'))
			.pipe(util.append('. .bashrc.local'))
			.pipe(stream);
	};
};
