/**
 * Module dependencies.
 */
var express = require('express')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , multer = require('multer')					// for multipart http request
  , session = require('express-session')
  , favicon = require('serve-favicon')
  , loggerMiddleware = require('morgan')
  , http = require('http')
  , path = require('path')
  , Q = require('q')
  , useragent = require('express-useragent')
  , passport = require('passport')
  , logger = require('./models/Logger').getLogger('system.log')
  , moment = require('moment')
  , template = require('./models/Template')
  ;

/**
 * Initialize system constants
 **/
function initConstant()
{
	// Here we check system settings to make sure the project setting is the latest one.
	template.checkSystemJson(logger);

	var system = require('./system.json');
	process.env.NODE_ENV 		= system.NODE_ENV;
	global.HOMEURL 				= 'http://' + system[system.NODE_ENV]['context.domain'];
	global.SERVERHOST 			= system[system.NODE_ENV]['context.host'];
	global.SERVERPORT 			= system[system.NODE_ENV]['context.port'];
	global.FOLDER_UPLOADS 		= path.join(__dirname + '/' + system[system.NODE_ENV]['folder.uploads']);
	global.FOLDER_TMP 			= path.join(__dirname + '/' + system[system.NODE_ENV]['folder.tmp']);
	global.URL_UPLOADS 			= system[system.NODE_ENV]['url.uploads'];
	global.URL_TMP 				= system[system.NODE_ENV]['url.tmp'];
	global.CASSANDRA_CLUSTER 	= system[system.NODE_ENV]['cassandra.hosts'] || ['localhost'];
	global.CASSANDRA_POOLSIZE 	= system[system.NODE_ENV]['cassandra.poolSize'] || 16;
	global.CASSANDRA_KEYSPACE 	= system[system.NODE_ENV]['cassandra.keyspace'];

	global.FACEBOOK_APP_ID 			= system[system.NODE_ENV]['facebook.id'];
	global.FACEBOOK_APP_SECRET 		= system[system.NODE_ENV]['facebook.secret'];
	global.GOOGLE_APP_ID 			= system[system.NODE_ENV]['google.id'];
	global.GOOGLE_APP_SECRET 		= system[system.NODE_ENV]['google.secret'];
	global.GOOGLE_ANALYTICS_CODE 	= system[system.NODE_ENV]['google.analytics_code'];
}

/**
 * Initialize database manager
 **/
function initDbmgr()
{
	var deferred = Q.defer();
	
	/*
	 * Neil_20140801: Change form Helenus to Node-Cassandra-CQL.
	 * Please also note that we don't use 9160 port anymore.
	 *
	 * Cassandra ports:
	 *   7199 - JMX (was 8080 pre Cassandra 0.8.xx)
	 *   7000 - Internode communication (not used if TLS enabled)
	 *   7001 - TLS Internode communication (used if TLS enabled)
	 *   9160 - Thift client API
	 *   9042 - CQL native transport port

	global.HELENUS_DMP = require('./models/Helenus').getManager(global.CASSANDRA_KEYSPACE, function(context, dbmgr) {
		logger.info('Helenus connection to Keyspace ' + global.CASSANDRA_KEYSPACE + ' built.');
	});
	*/

	require('./models/CQL3').getManager(
		global.CASSANDRA_CLUSTER,
		global.CASSANDRA_KEYSPACE,
		global.CASSANDRA_POOLSIZE
	)
	.then(function(dbmgr) {
		global.CQL3 = dbmgr;
	})
	.catch(function(ex) {
		deferred.reject(ex);
	})
	.done(function() {
		deferred.resolve();
	});

	return deferred.promise;
}

/**
 * Initialize application.
 **/
function initApp() 
{
	var app = express();

	// all environments
	app.set('port', global.SERVERPORT || 3000);
	app.set('views', path.join(__dirname + '/views'));
	app.set('view engine', 'pug');
	app.use(favicon(path.join(__dirname + '/public/images/cloudeep.ico')));
	app.use(loggerMiddleware('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	// Neil_20150814: Multer changes usage after 1.*, note the name should match the name of input.
	// app.use(multer({dest: global.FOLDER_TMP}).fields([{name: 'image', maxCount: 1}]));
	app.use(multer({dest: global.FOLDER_TMP}).single('image'));
	app.use(cookieParser());
	app.use(session({
		secret: 'cloudeep',
		resave: false,
		saveUninitialized: true
	}));

	// User authentication using Passport module, and it should be placed after express.session().
	app.use(passport.initialize());
	app.use(passport.session());

	app.use(require('stylus').middleware({
		src: path.join(__dirname + '/public'),
		compress: true
	}));
	app.use(require('express-minify')());
	app.use(express.static(path.join(__dirname, 'public'), { maxAge:3600 }));

	// init useragent
	app.use(useragent.express());
	app.use(function (req, res, next) {
		// Every pug page has a locals variable, set various information to it.
		res.locals.user = req.user;
		res.locals.useragent = (typeof(req.headers['user-agent'])!='undefined')? useragent.parse(req.headers['user-agent']): {};
		res.locals.moment = moment;
		next();
	});

	/**
	 * Route dependencies.
	 **/
	var routeIndex = require('./routes/index.js')
	  ;

	//
	// TODO: Write your route here.
	//
	app.get('/', routeIndex.index);
	
	// Restful sample
	app.use('/resource/restful', require('./routes/restful/RESTful'));


	// Route all exceptions (should be the last route) to error page.
	app.use(function(req, res) {
		res.status(404).render('404');
	});

	// The final error handling.
	process.on('uncaughtException', function(err) {
		logger.error(err.stack);
		process.exit(-1);
	});

	process.on('SIGINT', function(err) {
		logger.warn('Terminated by SIGINT.');
		process.exit();
	});

	// The http processes.
	http.createServer(app).listen(app.get('port'), function(){
		logger.info('Express server listening on port ' + app.get('port'));
	});
}

/**
 * Start
 **/
initConstant();
initDbmgr()
.then(initApp)
.done();