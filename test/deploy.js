'use strict';

var Promise = require('promise');
var test = require('tape');

var dotfiles = require('..');

var deploy = function(t, app, opts){
	opts.read = opts.read || {};
	opts.want = opts.want || {};

	var written = {};

	app.deploy({
		clients: {
			read: function(filepath){
				if (filepath in opts.read)
					return Promise.resolve(opts.read[filepath]);
				var err = new Error('ENOENT, open \'' + filepath + '\'');
				err.errno = 34;
				err.code = 'ENOENT';
				err.path = filepath;
				return Promise.reject(err);
			},
			write: function(filepath, data){
				written[filepath] = data.toString();
				return Promise.resolve();
			}
		},
		progress: function(){}
	}).then(function(){
		Object.keys(opts.want).forEach(function(k){
			t.ok(written[k].indexOf(opts.want[k]) > -1, 'contains ' + opts.want[k]);
		});
		t.end();
	});
};

test('deploy', function(t) {
	var app = dotfiles()
		.bash(__dirname + '/fixtures/bash/*');
	deploy(t, app, {
		want: {
			'.bashrc': 'baz=\'quux'
		}
	});
});

test('deploy local', function(t) {
	t.equal(typeof dotfiles().deploy.local, 'function');
	t.end();
});
