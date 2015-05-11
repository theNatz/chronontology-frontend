var express = require('express');
var es = require('../services/elasticsearch');
var router = express.Router();

router.post('/reindex', function(req, res) {
	es.indices.reindex(function(err, esRes) {
		if (err) {
			console.log(err.stack);
			res.status(500).send({ success: false, error: err.message });
		} else {
			res.send(esRes);
		}
	});
});

router.post('/reloadMappings', function(req, res) {
	es.indices.reloadMappings();
	res.send({ success: true} );
})

module.exports = router;