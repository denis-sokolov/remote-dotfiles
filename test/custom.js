'use strict';

var test = require('tape');

var dotfiles = require('..');

test('custom by path', function(t) {
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

test('custom by contents', function(t) {
	dotfiles()
		.custom({
			'.foo': 'some-contents'
		})
		.stream().on('data', function(file){
			t.equal(file.relative, '.foo', 'has custom name');
			t.ok(file.contents.toString().indexOf('some-contents') > -1, 'has custom contents');
			t.end();
		});
});

test('custom rethrow error', function(t) {
	dotfiles()
		.custom({
			'.foo': __dirname + '/this/path/does/not/exist'
		})
		.stream()
			.on('error', function(err){
				t.equal(err.code, 'ENOENT');
				t.end();
			})
			.on('end', function(){
				t.fail('Was supposed to error, not suceed');
			});
});
