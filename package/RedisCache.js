(function($module) {

    "use strict";

    var q     = require('q'),
        redis = require('redis');

    /**
     * @module RedisCache
     * @constructor
     */
    var RedisCache = function RedisCache() {};

    /**
     * @property prototype
     * @type {Object}
     */
    RedisCache.prototype = {

        /**
         * @property client
         * @type {Object}
         */
        client: null,

        /**
         * @property key
         * @type {String|Number}
         */
        key: null,

        /**
         * @property promise
         * @type {Object}
         */
        promise: null,

        /**
         * @property options
         * @type {Object}
         */
        options: {
            expiry: 86400
        },

        /**
         * @method connect
         * @param port {Number}
         * @param host {String}
         * @param redisOptions {Object}
         * @param password {String|Number}
         * @return {RedisCache}
         */
        connect: function connect(port, host, password, redisOptions) {

            // Establish the connection to the Redis server.
            this.client = redis.createClient(port || 6379, host || '127.0.0.1', redisOptions);

            if (password) {
                // Authorise if a password has been configured.
                this.client.auth(password);
            }

            return this;

        },

        /**
         * @method configure
         * @param options {Object}
         * @return {RedisCache}
         */
        configure: function configure(options) {
            this.options = options;
            return this;
        },

        /**
         * @method fetch
         * @param key {String}
         * @return {RedisCache}
         */
        fetch: function fetch(key) {

            // Create a new deferred for the retrieval of the data from Redis.
            var deferred = q.defer();
            this.promise = deferred.promise;
            this.key     = key;

            // Fetch the content from the Redis server.
            this.client.get(key, function (error, result) {

                if (error || !result) {

                    // An error occurred or the result was empty, therefore we'll reject
                    // the deferred.
                    deferred.reject();
                    return;

                }

                // Otherwise everything is perfectly fine and we can resolve the deferred.
                deferred.resolve(result);

            });

            return this;

        },

        /**
         * @method otherwise
         * @param method {Function}
         * @return {Q.promise}
         */
        otherwise: function otherwise(method) {

            var deferred = q.defer(),
                redis    = this.client,
                key      = this.key,
                options  = this.options;

            this.promise.then(function(collection) {

                // Resolve the deferred immediately, because we got the data directly from Redis.
                deferred.resolve(JSON.parse(collection));

            }).fail(function() {

                // Invoke the developer defined callback to retrieve the data.
                method(deferred, key);

                // When the developer has resolved the promise, we need to store the data in Redis
                // for next time.
                deferred.promise.then(function(data) {

                    // Store the data in Redis!
                    redis.setex(key, options.expiry, JSON.stringify(data));

                });

            });

            return deferred.promise;

        },

        /**
         * @method remove
         * @param key
         * @return {void}
         */
        remove: function remove(key) {
            this.client.del(key);
        }

    };

    $module.exports = new RedisCache();

}(module));