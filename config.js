module.exports = {
	// General info about the app
	app: {
		port: 80,
		domain: 'yourdomain.com',						// < Mention your domain
		publicFolder: '../client/public/'
	},

	// Database information
	db: {
		url: 'mongodb://host:port/db'      // > Mention your Mongo collection
	},

	// Route URLs definition
	routes: {
		iframe: '/api/iframe',
		socket: '/stream',
		requestKey: '/claimKey'
	},

	/**
	 * Server log to debug
	 * Please keep it minimalist on prod
	 */
	log: {
		// Status is an interval log about the amount of connected
		// sockets every interval
		statusInterval: 60,   // in seconds, use 0 to disable
		statusDetailed: false  // log the list of windows and remotes
	},

	// Remote settings
	remote: {
		uiList: [
			'touch',
			'gyro',
			'button'
		]
	}
};
