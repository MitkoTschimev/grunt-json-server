# grunt-json-server

> Give it a JSON or JS seed file and it will serve it through REST routes.

## Getting Started
This plugin uses [JSON Server](https://github.com/typicode/json-server) to serve a REST api from a provided db file. For more information please go to [JSON Server](https://github.com/typicode/json-server).

This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-json-server --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-json-server');
```

## The "json_server" task

### Overview
In your project's Gruntfile, add a section named `json_server` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  json_server: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### options.port
Type: `Number`
Default value: `13337`

A number value that is used for the server port.

#### options.hostname
Type: `String`
Default value: `'0.0.0.0'`

A string value that is used for the server address.

#### options.db
Type: `String`
Default value: `'db.json'`

A string value that is the location to the db file which gets translated to restful routes 

#### options.routes
Type: `String`
Default value: `undefined`

A string value that is the location to the routes JSON file which contains additional routes
 
#### options.customRoutes
Type: `Object`
Default value: `undefined`

A key-value pairs of custom routes that should be applied to server. 

### Usage Examples

#### Default Options
In this example, the file db.json in the api folder gets parsed and translated to restful routes and starts a server on http://0.0.0.0:13337

```js
grunt.initConfig({
    json_server: {
        options: {
            port: 13337,
            hostname: '0.0.0.0',
            db: 'api/db.json'
        }
    },
});
```

#### Custom routes
You can pass an object with configuration for custom routes
 
```js
grunt.initConfig({
     json_server: {
         options: {
             port: 13337,
             hostname: '0.0.0.0',
             db: 'api/db.json',
             customRoutes: {
                 '/big_post': {
                    method: 'get',
                    handler: function(req, res) {
                        return res.json({id: 1, title: 'Big post'});
                    }
                 }
             }        
         }
     }
});
```

### Usage with connect in grunt
If you want to use it with the grunt connect plugin it is recommend to setup it with the concurrent plugin otherwise json_server will block everything
```js
grunt.initConfig({
    json_server: {
        options: {
            port: 13337,
            hostname: '0.0.0.0',
            db: 'api/db.json'
        }
    },
    
    // Run some tasks in parallel to speed up build process
    concurrent: {
        server: {
            tasks: [
                'json_server',
                'watch'
            ],
            options: {
                logConcurrentOutput: true
            }
        }
    }
});

grunt.task.run([
    'connect:livereload',
    'concurrent:server'
]);
```


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## License
[MIT License](LICENSE-MIT)

## Author
*[Mitko Tschimev](https://github.com/tfiwm)*
