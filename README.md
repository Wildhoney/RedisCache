RedisCache
==========

<img src="https://travis-ci.org/Wildhoney/RedisCache.png?branch=master" />
&nbsp;
<img src="https://badge.fury.io/js/rediscache.png" />

Install with npm: `npm install rediscache`

Simple Node.js based Redis cache for storing large collections of data.

RedisCache makes it very simple to asynchronously respond with a collection of models from the cache. It uses <a href="http://en.wikipedia.org/wiki/Method_chaining">method chaining</a> for clarity in conjunction with the <a href="http://en.wikipedia.org/wiki/Futures_and_promises">promise pattern</a>.

Installation
----------

It's a prerequisite to have <a href="http://jasdeep.ca/2012/05/installing-redis-on-mac-os-x/" target="_blank">Redis installed</a>. Once installed you can begin the Redis server with `redis-server`.

Initiate the Node.js server with `node example/server.js` and then point your browser to `localhost:3000`.

Getting Started
----------

Using Node.js you need to first include RedisCache to begin using it.

```javascript
var cache = require('rediscache');
```

RedisCache will establish a connection with the Redis server once you've invoked `connect` &ndash; passing in the `port`, `host`, and `password` &ndash; all of which being optional.

By default RedisCache will attempt to connect to `127.0.0.1` on port `6379` with no auth password.

```javascript
cache.connect(6379).configure({
    expiry: 86400
});
```

With the above code example we're also invoking `configure` which allows us to specify additional options such as `expiry` (default is `86400`).

RedisCache should now have connected with Redis, and you're ready to begin adding Redis caching to your actions.

Like promises &ndash; which RedisCache uses, you need to setup a method chain for each step. RedisCache uses: `fetch('cache-name')` -> `otherwise(function(deferred, cacheKey) {})` -> `then(function(models) {})` -> `fail(function() {})`.

```javascript
cache.fetch('words').otherwise(function(deferred, cacheKey) {

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
```

In the above code we first attempt to load the cache with `fetch`, and if that doesn't exist then the `otherwise` method will be invoked &ndash; it's up to you to `resolve` or `reject` the promise. If it succeeds then it will go into `then` to output using `response.send`, else it will fall into `fail` and output an empty array (`[]`).

<h3>More Compact?</h3>

The above example may seem quite verbose for *one line*, however it's merely invoking a sequence of methods as is typical with promises. To make it more compact you could place each method into your object.

```javascript
var responder = {};
cache
    .fetch('words')
    .otherwise(responder.loadCollection)
    .then(responder.sendResponse)
    .fail(responder.sendEmptyResponse);
```

That way you could abstract the `responder` and use that object for each one of your collection calls &ndash; `otherwise` sends the cache key as the second argument for abstraction purposes.