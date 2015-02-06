'use strict';

var test = require('tape');

var dotfiles = require('..');

test('pretty', function (t) {
	t.plan(1);

	var s = dotfiles()
		.bash(__dirname + '/fixtures/bash/*.sh')
		.ssh('foo')
		.servers([{host:'example.com', port: 3133}])
		.stream()
		.pipe(dotfiles.pretty());

	s.on('data', function(txt){
		if (txt.indexOf('File: .bashrc') > -1)
			t.pass('Got a textual description');
	});
});
