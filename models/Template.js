var fs = require('fs')
  ;

exports.checkSystemJson = function(logger) {
	// Make sure the local system.json is existed.
	if (!fs.existsSync('./system.json')) {
		logger.error("No system.json existed. Don't forget to copy out from ./common folder.");
		process.exit(-1);
	}

	// Suppose the local system.json should has the same lines with common/system.json.
	var linesCommon = fs.readFileSync('./common/system.json', 'utf8').split('\n').length;
	var linesLocal = fs.readFileSync('system.json', 'utf8').split('\n').length;
	if (linesCommon != linesLocal) {
		logger.error("The common/system.json might be updated. Please confirm the settings first.");
		return process.exit(-1);
	}
}
