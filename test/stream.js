'use strict';

var test = require('tape');

var dotfiles = require('..');

test('stream ends', function (t) {
	t.plan(1);

	var s = dotfiles()
		.bash(__dirname + '/fixtures/bash/*.sh')
		.ssh('foo')
		.servers([{host:'example.com', port: 3133}])
		.stream();

	var fileCount = 0;
	s.on('data', function(){
		fileCount += 1;
	});

	s.on('end', function(){
		t.equal(fileCount, 2);
	});
});
