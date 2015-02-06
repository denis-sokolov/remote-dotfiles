'use strict';

var test = require('tape');

var dotfiles = require('..');

test('bash', function(t) {
	dotfiles()
		.bash(__dirname + '/fixtures/bash/*')
		.stream().on('data', function(file){
			t.equal(file.relative, '.bashrc', 'has .bashrc name');
			t.ok(file.contents.toString().indexOf('baz=\'quux') > -1, 'has .bashrc contents');
			t.end();
		});
});

test('bash local', function(t) {
	dotfiles()
		.bash(__dirname + '/fixtures/bash/*')
		.stream().on('data', function(file){
			t.ok(file.contents.toString().indexOf('.bashrc.local for') > -1, 'has local comment');
			t.ok(file.contents.toString().indexOf('. .bashrc.local') > -1, 'has local call');
			t.end();
		});
});

test('bash remote', function(t){
	dotfiles()
		.servers([{host:'example.com'}])
		.bash(__dirname + '/fixtures/bash/*')
		.stream('example.com').on('data', function(file){
			if (file.relative !== '.bashrc') return;
			t.ok(file.contents.toString().indexOf('baz=\'quux') > -1, 'has .bashrc contents');
			t.end();
		});
});
