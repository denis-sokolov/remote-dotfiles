'use strict';

var test = require('tape');

var dotfiles = require('..');

test('error if double settings', function (t) {
	t.throws(function(){
		dotfiles()
			.servers([{host: 'example.com', port: 3133}])
			.servers([{host: 'example.com', port: 3134}]);
	});
	t.end();
});
