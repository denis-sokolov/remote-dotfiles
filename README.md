# Remote dotfiles

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
            host: 'gateway.example.com',
            port: 3133
        }
    ])
    .proxies(function(from, to){
        if (to === 'prod') return 'gate';
    })
    .ssh('ServerAliveInterval 30');
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
