module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['package/RedisCache.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        copy: {
            main: {
                src: 'package/RedisCache.js',
                dest: 'dist/<%= pkg.name %>.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('test', ['jshint']);
    grunt.registerTask('build', ['copy']);
    grunt.registerTask('default', ['test', 'build']);

};