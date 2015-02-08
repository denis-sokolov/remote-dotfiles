'use strict';

var test = require('tape');

var dotfiles = require('..');

test('custom', function(t) {
	dotfiles()
		.custom({
			'.foo': __dirname + '/fixtures/bash/aliases.sh'
		})
		.stream().on('data', function(file){
			t.equal(file.relative, '.foo', 'has custom name');
			t.ok(file.contents.toString().indexOf('baz=\'quux') > -1, 'has custom contents');
			t.end();
		});
});
