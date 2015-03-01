'use strict';

var test = require('tape');

var dotfiles = require('..');

test('deploy', function(t) {
	t.equal(typeof dotfiles().deploy, 'function');
	t.end();
});

test('deploy local', function(t) {
	t.equal(typeof dotfiles().deploy.local, 'function');
	t.end();
});
