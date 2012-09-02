module.exports = function(grunt) {
  grunt.initConfig({
    min: {
      dist: {
        src: ['src/jquery.beautylist.js'],
        dest: 'src/jquery.beautylist-min.js'
      }
    }
  });

  grunt.registerTask('default', 'min')
}