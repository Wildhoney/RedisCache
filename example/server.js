(function() {

    var express = require('express'),
        fs      = require('fs'),
        cache   = require('../dist/rediscache.js'),
        app     = express();

    app.listen(3000);

    // Connect and configure RedisCache!
    cache.connect(6379).configure({
        expiry: 86400
    });

    app.get('/', function(request, response) {

        cache.fetch('words').otherwise(function(deferred) {

            // Read the file because we don't have a cache object currently.
            fs.readFile('words.json', 'utf8', function(error, models) {

                // Store the data in the Redis cache object.
                deferred.resolve(JSON.parse(models));

            });

        }).then(function(models) {

            // We have the data so we can output it to the browser!
            response.send(models);

        }).fail(function() {

            // Invoked when you reject the promise above.
            response.send([]);

        });

    });

})();