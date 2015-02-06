'use strict';

var through2 = require('through2');

var repeat = function(str, times){
	var res = '';
	while (times > 0) {
		res += str;
		times -= 1;
	}
	return res;
};

module.exports = function(){
	return through2.obj(function(file, enc, cb){
		this.push([
			'File: ' + file.relative,
			repeat('-', 6 + file.relative.length),
			'\t' + file.contents.toString().replace(/\n/g, '\n\t').trim(),
			''
		].join('\n') + '\n');
		cb();
	});
};
