'use strict';

var fs = require('fs');

var Promise = require('promise');
var Vinyl = require('vinyl');

module.exports = function(util, app){
	var filesSetting = util.setting(app, 'custom');

	var getData = function(input){
		return Promise.denodeify(fs.readFile)(input);
	};

	return function(stream){
		var files = filesSetting() || {};
		return Promise.all(Object.keys(files).map(function(key){
			return getData(files[key])
				.then(function(data){
					stream.push(new Vinyl({
						path: key,
						contents: new Buffer(data)
					}));
				});
		}));
	};
};
