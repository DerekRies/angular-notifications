module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt
			.initConfig({
				uglify : {
					dist : {
						files : {
							'notification.min.js' : 'notification.js'
						}
					}
				}
			});

	// Default task.
	grunt.registerTask('default', ['uglify' ]);
};
