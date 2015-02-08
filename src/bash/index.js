'use strict';

var Promise = require('promise');

module.exports = function(util, app){
	var sources = util.settings(app, 'bash');

	return function(stream){
		return new Promise(function(resolve){
			if (!sources())
				return resolve();

			var ours = util.src(sources())
				.pipe(util.concat('.bashrc'))
				.pipe(util.comment.stream('# ', 'Use .bashrc.local for editing'))
				.pipe(util.append('. .bashrc.local'));
			ours.pipe(stream, {end: false});
			ours.on('end', function(){
				resolve();
			});
		});
	};
};
