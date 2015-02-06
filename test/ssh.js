'use strict';

var test = require('tape');

var dotfiles = require('..');

test('ssh', function (t) {
	dotfiles()
		.servers([{host:'example.com', port: 3133, alias: 'example'}])
		.stream().on('data', function(file){
			t.equal(file.relative, '.ssh/config', 'has .ssh/config name');
			t.ok(file.contents.toString().indexOf('Host example') > -1, 'has Host rule');
			t.ok(file.contents.toString().indexOf('HostName example.com') > -1, 'has Host rule');
			t.ok(file.contents.toString().indexOf('Port 3133') > -1, 'has Port');
			t.end();
		});
});

test('ssh alphabetized', function (t) {
	dotfiles()
		.servers([{host:'b.example.com'}, {host:'a.example.com'}])
		.stream().on('data', function(file){
			var contents = file.contents.toString();
			t.ok(contents.indexOf('a.example.com') < contents.indexOf('b.example.com'));
			t.end();
		});
});

test('ssh empty', function (t) {
	dotfiles()
		.servers([{host:'example.com'}])
		.stream().on('data', function(file){
			t.ok(file.contents.toString().indexOf('undefined') === -1, 'has no undefined');
			t.end();
		});
});


test('ssh custom', function (t) {
	dotfiles()
		.ssh('Port 29')
		.stream().on('data', function(file){
			var contents = file.contents.toString();
			t.ok(contents.indexOf('Port 29') > -1, 'has custom rule');
			t.ok(contents.indexOf('Host *') > -1, 'Adds Host * at the end');
			t.ok(contents.indexOf('Host *') < contents.indexOf('Port 29'));
			t.end();
		});
});

test('ssh proxy', function (t) {
	t.plan(1);
	dotfiles()
		.servers([{host:'example.com'}, {host:'proxy.example.com'}])
		.proxies(function(from, to){
			if (to.host === 'example.com')
				return 'proxy.example.com';
		})
		.stream().on('data', function(file){
			t.equal(file.contents.toString().match(/ProxyCommand/).length, 1);
		});
});

test('ssh proxy does not set from.host', function (t) {
	t.plan(1);
	dotfiles()
		.servers([{host:'example.com'}, {host:'proxy.example.com'}])
		.proxies(function(from){
			if (from.host)
				t.fail('should not set from.host');
		})
		.stream().on('data', function(){
			t.pass();
		});
});

test('ssh proxy remote self', function (t) {
	dotfiles()
		.servers([{host:'example.com'}, {host:'proxy.example.com'}])
		.proxies(function(from, to){
			if (to.host === 'example.com')
				return 'proxy.example.com';
		})
		.stream('proxy.example.com').on('data', function(file){
			t.equal(file.contents.toString().indexOf('ProxyCommand'), -1);
			t.end();
		});
});

test('ssh check settings types', function (t) {
	t.throws(function(){
		dotfiles().proxies('foo');
	});
	t.throws(function(){
		dotfiles().servers({host:'example.com'});
	});
	t.throws(function(){
		dotfiles().ssh(35);
	});
	t.end();
});
