var express = require('express');
var es = require('../services/elasticsearch');
var router = express.Router();
var types = require('../../config/application').types;

// setup routes for every type
types.forEach(function(type) {
	
	// handle GETs
	router.get('/' + type + '/:id', function(req, res) {
		res.format({
			'application/json': function() {
				es.get(type, req.params.id, function(err, esRes) {
					if (err) {
						var status = esRes.status;
						if (!status) status = 404;
						console.error(err.stack);
						res.status(status).send({ success: false, error: err.message });
					} else {
						res.status = 200;
						res.send(esRes);
					}
				});
			},
			'text/html': function() {
				res.sendfile('public/index.html');
			}
		})
		
	});

	// handle PUTs
	router.put('/' + type + '/:id', function(req, res) {
		es.index(type, req.params.id, req.body, function(err, esRes) {
			if (err) {
				console.error(err.stack);
				res.status(esRes.status).send({ success: false, error: err.message });
			} else {
				res.status = 200;
				res.location(req.originalUrl);
				res.send(esRes);
			}
		});
	});

	// handle POSTs
	router.post('/' + type + '/?', function(req, res) {
		es.create(type, req.body, function(err, esRes) {
			if (err) {
				console.error(err.stack);
				res.status(esRes.status).send({ success: false, error: err.message });
			} else {
				res.location(esRes['@id']);
				res.status = 201;
				res.send(esRes);
			}
		});
	});

	// handle DELETEs
	router.delete('/' + type + '/:id', function(req, res) {
		es.delete(type, req.params.id, function(err, esRes) {
			if (err) {
				console.error(err.stack);
				res.status(esRes.status).send({ success: false, error: err.message });
			} else {
				res.status = 204;
				res.send();
			}
		});
	});

	// handle queries
	router.get('/' + type + '/?', function(req, res) {
		es.search(type, req.query, function(err, esRes) {
			if (err) {
				console.error(err.stack);
				res.status(esRes.status).send({ success: false, error: err.message });
			} else {
				res.status = 200;
				var response = { results: [], total: esRes.hits.total };
				for (var i = 0; i < esRes.hits.hits.length; i++) {					
					response.results.push(esRes.hits.hits[i]._source);
				};
				res.send(response);
			}
		});
	});

});

module.exports = router;