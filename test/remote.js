'use strict';

var test = require('tape');

var dotfiles = require('..');

test('remote', function (t) {
	dotfiles()
		.servers([{host:'example.com', port: 3133, alias: 'example'}])
		.stream('example').on('data', function(file){
			t.equal(file.contents.toString().indexOf('Host example'), -1, 'has no self-Host rule');
			t.end();
		});
});
