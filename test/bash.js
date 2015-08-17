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
		.servers([{host: 'example.com'}])
		.bash(__dirname + '/fixtures/bash/*')
		.stream('example.com').on('data', function(file){
			if (file.relative !== '.bashrc') return;
			t.ok(file.contents.toString().indexOf('baz=\'quux') > -1, 'has .bashrc contents');
			t.end();
		});
});

test('bash list', function(t) {
	dotfiles()
		.bash([
			__dirname + '/fixtures/bash/aliases*',
			__dirname + '/fixtures/bash/functions*'
		])
		.stream().on('data', function(file){
			var contents = file.contents.toString();
			t.ok(contents.indexOf('foo=') > -1, 'includes aliases');
			t.ok(contents.indexOf('foo()') > -1, 'includes functions');
			t.end();
		});
});

test('bash separate arguments', function(t) {
	dotfiles()
		.bash(
			__dirname + '/fixtures/bash/aliases*',
			__dirname + '/fixtures/bash/functions*'
		)
		.stream().on('data', function(file){
			var contents = file.contents.toString();
			t.ok(contents.indexOf('foo=') > -1, 'includes aliases');
			t.ok(contents.indexOf('foo()') > -1, 'includes functions');
			t.end();
		});
});

test('bash takes raw values along globs', function(t) {
	dotfiles()
		.bash(
			'raw=bar',
			__dirname + '/fixtures/bash/functions*'
		)
		.stream().on('data', function(file){
			var contents = file.contents.toString();
			t.ok(contents.indexOf('raw=') > -1, 'includes raw');
			t.ok(contents.indexOf('foo()') > -1, 'includes functions');
			t.end();
		});
});

test('bash takes functions', function(t) {
	t.plan(2);
	var config = dotfiles()
		.servers([{host: 'example.com'}])
		.bash(
			function(server){
				if (server.alias === 'example.com')
					return 'echo onremote';
				return 'echo onlocal';
			}
		);
	config.stream().on('data', function(file){
		if (file.relative !== '.bashrc')
			return;
		t.ok(file.contents.toString().indexOf('onlocal') > -1, 'includes local result');
	});
	config.stream('example.com').on('data', function(file){
		if (file.relative !== '.bashrc')
			return;
		t.ok(file.contents.toString().indexOf('onremote') > -1, 'includes remote result');
	});
});

test('bash bin', function(t){
	t.plan(4);
	dotfiles()
		.bin(
			__dirname + '/fixtures/bin/foo.py'
		)
		.stream()
		.on('data', function(file){
			if (file.relative === '.bashrc') {
				t.ok(file.contents.toString().indexOf('.bin:$PATH') > -1, 'adds PATH modification');
			} else {
				t.equal(file.relative, '.bin/foo');
				t.ok(file.executable);
				t.equal(file.contents.toString(), 'print \'Hello, world\'\n');
			}
		});
});
