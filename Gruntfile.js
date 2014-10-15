module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['package/redis-cache.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        copy: {
            main: {
                src: 'package/redis-cache.js',
                dest: 'dist/<%= pkg.buildName %>.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('test', ['jshint']);
    grunt.registerTask('build', ['copy']);
    grunt.registerTask('default', ['test', 'build']);

};