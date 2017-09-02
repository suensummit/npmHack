/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index');
};

exports.main = function(req, res){
	res.render('main');
};

exports.deco = function(req, res){
	res.render('deco');
};