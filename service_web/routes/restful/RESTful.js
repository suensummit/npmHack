/*
 * A RESTful route template.
 */

var router = require('express').Router()
  ;

// List
router.get('/', function(req, res) {
	res.end('LIST');
});

// Retrieve
router.get('/:id', function(req, res) {
	var id = req.params.id;
	res.end('RETRIEVE ' + id);
});

// Create
router.post('/', function(req, res) {
	res.end('CREATE');
})

// Update
router.put('/:id', function(req, res) {
	var id = req.params.id;
	res.end('UPDATE ' + id);
});

// Delete
router.delete('/:id', function(req, res) {
	var id = req.params.id;
	res.end('DELETE ' + id);
});

module.exports = router;