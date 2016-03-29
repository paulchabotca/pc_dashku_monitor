'use strict';



// Deconstruct the Redis cloud credentials for use with Node's redis client
//
if (process.env.REDISCLOUD_URL) {
	var redisHost = process.env.REDISCLOUD_URL.split('@')[1].split(':')[0],
		redisPort = process.env.REDISCLOUD_URL.split('@')[1].split(':')[1],
		redisPass = process.env.REDISCLOUD_URL.split(':')[2].split('@')[0];
}


module.exports = {

	development: {
		port 	: process.env.PORT || 3000,
		db 		: process.env.MONGOLAB_URI || 'mongodb://localhost/dashku_development',
		redis 	: {
			port: redisPort || 6379,
			host: redisHost || '127.0.0.1',
			pass: redisPass || null		
		},
		apiUrl: (process.env.APP_URL || 'http://localhost:3000') + '/api/transmission',
		apiHost: (process.env.APP_URL || 'http://localhost:3000') + '/',
		forgottenPasswordUrl: (process.env.APP_URL || 'http://localhost:3000') + '/?fptoken=',
		mail: {
			service: 'Gmail',
			auth: {
				user: 'username',
				pass: 'password'
			}
		},
		packAssets: {},
		sessionSecret: 'feK4li1aek8koe7JeiC3shai7ahy7uduch5ahY7n'
	},



	cucumber: {
		port: 3001,
		db: 'mongodb://localhost/dashku_cucumber',
		redis: {
			port: 6379,
			host: '127.0.0.1'
		},
		apiUrl: 'http://localhost:3001/api/transmission',
		apiHost: 'http://localhost:3001/',
		forgottenPasswordUrl: 'http://localhost:3001/?fptoken=',
		mail: {
			service: 'stub'
		},
		packAssets: {},
		sessionSecret: 'feK4li1aek8koe7JeiC3shai7ahy7uduch5ahY7n'
	},



	test: {
		port: 3002,
		db: 'mongodb://localhost/dashku_test',
		redis: {
			port: 6379,
			host: '127.0.0.1'
		},
		apiUrl: 'http://localhost:3002/api/transmission',
		apiHost: 'http://localhost:3002/',
		forgottenPasswordUrl: 'http://localhost:3002/?fptoken=',
		mail: {
			service: 'stub'
		},
		packAssets: {},
		sessionSecret: 'feK4li1aek8koe7JeiC3shai7ahy7uduch5ahY7n'
	},



	docker: {
		port: process.env.PORT || 3000,
		db: process.env.MONGODB_URL || 'mongodb://' + process.env.MONGO_1_PORT_27017_TCP_ADDR + ':' + process.env.MONGO_1_PORT_27017_TCP_PORT + '/dashku_docker',
		redis: {
			port: process.env.REDIS_PORT_6379_TCP_PORT,
			host: process.env.REDIS_PORT_6379_TCP_ADDR
		},
		apiUrl: 'http://localhost:3000/api/transmission',
		apiHost: 'http://localhost:3000/',
		forgottenPasswordUrl: 'http://localhost:3000/?fptoken=',
		mail: {
			service: 'stub'
		},
		packAssets: {},
		sessionSecret: 'feK4li1aek8koe7JeiC3shai7ahy7uduch5ahY7n'

	}

};