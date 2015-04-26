module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt
			.initConfig({
				uglify : {
					dist : {
						files : {
							'dist/notification.min.js' : 'notification.js'
						}
					}
				},
				less : {
					dist : {
						files : {
							'dist/notification.css' : 'notifications.less'
						}
					}
				}
			});

	// Default task.
	grunt.registerTask('default', ['uglify', 'less' ]);
};
