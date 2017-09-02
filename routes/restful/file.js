var router = require('express').Router()
  , sprintf = require('sprintf')
  , moment = require('moment')
  , Q = require('q')
  , fs = require('fs')
  , path = require('path')

  ;
/**
 * @api {post} /file/ Update or Create Constant
 * @apiName		updateOrCreateConstant
 * @apiGroup	Constant
 *
 * @apiParam	{String} Name 	Name of Constant.
 * @apiParam	{String} Value	Value of Constant.
 *
 * @apiSuccess	{String} Name 	Name of Constant.
 * @apiSuccess	{String} Value	Value of Constant.
 */
router.post('/', function(req, res) {
	console.log(req.body);
	console.log(req.file);
	var original_ext = '';
	var original_name = new String(req.file.originalname);
	var extIndex = original_name.lastIndexOf('.');
	if (extIndex != -1) {
		original_ext = original_name.substr(extIndex, original_name.length);
	}

	var new_name = req.body.name + original_ext;
	if (!fs.existsSync(global.FOLDER_UPLOADS)) fs.mkdirSync(global.FOLDER_UPLOADS);

	var dest = moveTmpFile(
		req.file.filename,
		global.FOLDER_UPLOADS,
		new_name
	);

	return res.json({
		original_filename: original_name,
		filename: new_name,
		name: req.body.name
	});
	
});

module.exports = router;

/**
 * 
 * @param {*} filename 
 * @param {*} new_path 
 * @param {*} new_name 
 */
function moveTmpFile(filename, new_path, new_name) {
	if (!fs.existsSync(global.FOLDER_TMP)) fs.mkdirSync(global.FOLDER_TMP);
	if (!fs.existsSync(new_path)) fs.mkdirSync(new_path);

	var pathFrom = path.join(global.FOLDER_TMP, filename);
	var pathTo = path.join(new_path, new_name);

	fs.createReadStream(pathFrom).pipe(fs.createWriteStream(pathTo));
	fs.unlink(pathFrom);
	return pathTo;
}

function moveUploadFile(new_path, new_name) {
	var pathTo = path.join(new_path, new_name);
	fs.unlink(pathTo);
	return pathTo;
}