#!/usr/bin/env node
'use strict';

var argparse = require('argparse');

var deploy = require('./deploy');

var parser = new argparse.ArgumentParser({
	description: 'Handle your remote-dotfiles'
});
var subparsers = parser.addSubparsers({
	title: 'command',
	dest: 'command'
});

var deployParser = subparsers.addParser('deploy', {
	help: 'Deploys your configuration'
});
deployParser.addArgument(['configuration'], {
	help: 'Your dotfiles configuration in a JavaScript file that module.exports'
});
deployParser.addArgument(['target'], {
	help: 'Where to deploy, a server alias, "all", or "local"'
});
var args = parser.parseArgs();

if (args.command !== 'deploy')
	throw new Error('Unexpected command.');

deploy(args);
