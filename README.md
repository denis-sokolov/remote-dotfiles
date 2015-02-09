# Remote dotfiles

[![Build Status](https://travis-ci.org/denis-sokolov/remote-dotfiles.svg?branch=master)](https://travis-ci.org/denis-sokolov/remote-dotfiles)
[![Code Climate](http://img.shields.io/codeclimate/github/denis-sokolov/remote-dotfiles.svg)](https://codeclimate.com/github/denis-sokolov/remote-dotfiles)
[![Coverage Status](https://img.shields.io/coveralls/denis-sokolov/remote-dotfiles.svg)](https://coveralls.io/r/denis-sokolov/remote-dotfiles?branch=master)
[![bitHound Score](https://app.bithound.io/denis-sokolov/remote-dotfiles/badges/score.svg)](http://app.bithound.io/denis-sokolov/remote-dotfiles)
[![Dependency Status](https://gemnasium.com/denis-sokolov/remote-dotfiles.svg)](https://gemnasium.com/denis-sokolov/remote-dotfiles)

Describe your dotfiles configuration, have it automatically tuned for every server and then automatically deploy to all your servers.

```javascript
var config = dotfiles()
    .bash(__dirname + '/bash/*.sh')
    .servers([
        {
            alias: 'prod',
            host: 'production.example.com'
        },
        {
            alias: 'gate',
            forwardAgent: true,
            host: 'gateway.example.com',
            port: 3133
        }
    ])
    .proxies(function(from, to){
        if (to === 'prod') return 'gate';
    })
    .ssh('ServerAliveInterval 30')
    .custom({
        // Deploy any custom files
        // Make sure a custom file has a string 'remote-dotfiles' in it to enable overwriting
        '.gitignore': __dirname + '/gitconfig'
    });
```

You can investigate the resulting config file set:
```javascript
// Get a stream of Vinyl files for local machine
config.stream();

// Get a stream of Vinyl files for machine aliased prod
config.stream('prod');

// Or use a pretty printer in the console
config.stream()
    .pipe(dotfiles.pretty())
    .pipe(process.stdout, {end: false});
```

Now you should deploy it:
```javascript
config.deploy().done();

config.deploy(function(progress){
    console.log(Math.round(progress * 100) + '% done.');
}).done();
```

## `.bash`

```javascript
// Short call
config.bash(__dirname + '/*.sh');

// Use a list
config.bash([
    __dirname + '/*.sh',
    __dirname + '/*.bash'
]);

// Use separate arguments
config.bash(
    __dirname + '/*.sh',
    __dirname + '/*.bash'
);

// Use raw data
config.bash(
    'alias foo=bar',
    __dirname + '/*.bash'
);

// Use functions
config.bash(
    // server will be an empty object if generating for localhost
    function(server){
        return 'echo Welcome to ' + server.alias;
    }
);
```
