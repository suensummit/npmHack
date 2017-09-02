var fs = require('fs')
  , winston = require('winston')
  , moment = require('moment')
  ;

var log_dir = './logs/';

exports.getLogger = function(log_file) {
	var logfile = log_dir + log_file;

	if (!fs.existsSync(logfile)) {
		if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');
		fs.openSync(logfile, "a+");
	}
	var logger = new (winston.Logger)({
		transports: [
			new (winston.transports.Console)(),
			new (winston.transports.File)({
			// Uncomment this if daily rotate is needed.
			// new (winston.transports.DailyRotateFile)({
				json:		false,
				maxsize:	20 * 1024 * 1024,
				maxFiles:	10,
				colorize:	false,
				datePattern:	'.yyyyMMdd',
				timestamp:	function() { return moment().format('YYYY-MM-DD HH:mm:ss'); },
				filename:	logfile 
			})
		]
	});
	logger.cli();
	
	return logger;
}
