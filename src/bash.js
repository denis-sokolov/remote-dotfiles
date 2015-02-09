'use strict';

var Promise = require('promise');

module.exports = function(util, app){
	var sources = util.settings(app, 'bash');

	return function(stream, target){
		return new Promise(function(resolve){
			if (!sources())
				return resolve();

			var ours = util.src(sources(), target)
				.pipe(util.concat('.bashrc'))
				.pipe(util.comment.stream('# ', 'Use .bashrc.local for editing'))
				.pipe(util.append('[ -f .bashrc.local ] && . .bashrc.local'));
			ours.pipe(stream, {end: false});
			ours.on('end', function(){
				resolve();
			});
		});
	};
};
