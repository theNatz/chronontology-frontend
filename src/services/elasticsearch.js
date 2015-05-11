var express = require('express');
var elasticsearch = require('elasticsearch');
var Promise = require('bluebird');
var randomValueBase64 = require('../helpers/utils').randomValueBase64;
var types = require('../../config/application').types;
var errors = require('elasticsearch').errors;

var mappings = {};
types.forEach(function(type) {
	var path = '../../config/types/' + type + '/mapping';
	mappings[type] = require(path);
});

var client = new elasticsearch.Client({
	host: 'localhost:9200',
	log: 'info'
});

var indexName = 'jeremy';

function get(type, id, callback) {
	var req = { index: indexName, type: type, id: id };
	client.get(req, function(err, res) {
		if (err) {
			callback(err, res);
		} else {
			console.log(res._version);
			res._source['version'] = res._version;
			callback(null, res._source);
		}
	});
}

function index(type, id, content, callback) {
	content['@id'] = '/' + type + '/' + id;
	if (!content['modified'] ||
			Object.prototype.toString.call( content['modified'] ) != '[object Array]')
		content['modified'] = [];
	content['modified'].push(new Date());
	if (!content['version'] || typeof content['version']  != 'number')
		content['version'] = 0;
	var version = content['version']++;
	var req = { index: indexName, type: type, id: id, body: content, version: version };
	client.index(req, function(err, res) {
		if (err) {
			callback(err, res);
		} else {
			callback(null, content);
		}
	});
}

function create(type, content, callback) {
	var id = randomValueBase64(12).toLowerCase();
	content['@id'] = '/' + type + '/' + id;
	content['created'] = new Date();
	content['modified'] = [new Date()];
	var req = { index: indexName, type: type, body: content, id: id };			
	client.create(req, function(err, res) {
		// retry with different id until conflict is resolved
		if (err && res.status == 409) {
			create(type, content, callback);
		} else {
			if (err) {
				callback(err, res);
			} else {
				callback(null, content);
			}
		}		
	});
}

function remove(type, id, callback) {
	var req = { index: indexName, type: type, id: id };
	client.delete(req, function(err, res) {
		if (err) {
			callback(err);
		} else {
			callback(res);
		}
	});
}

function search(type, query, callback) {
	query.index = indexName;
	query.type = type;
	client.search(query, function(err, res) {
		callback(err, res);
	});
}

var indicesApi = {

	// create index, set mappings and setup alias
	setup: function(callback) {
		indicesApi.retrieveCurrentIndex(indexName, function(err, currentIndex) {
			if (err) {
				currentIndex = indexName + "_1";
			}
			client.indices.create({ index: currentIndex }, function(err, res) {
				if (err && err.message.lastIndexOf("IndexAlreadyExistsException", 0) === 0) 
					console.log("Index already exists", currentIndex);
				else if (err)
					return callback(err, null);
				else
					console.log("Created index", currentIndex, res);
				indicesApi.updateMappings(currentIndex, function(err, res) {
					console.log("Updated mappings", res);
					client.indices.putAlias(
							{ index: currentIndex, name: indexName },
							function(err, res) {
						console.log("Set alias", res);
						return callback(null, true);
					});
				});
			});
		});
	},

	// get index to which alias currently points
	retrieveCurrentIndex: function(alias, callback) {
		client.indices.getAlias({ name: alias }, function(err, res) {
			if (err) return callback(err, null);
			var indices = Object.keys(res);
			var currentIndex = indexName + "_1";
			if (indices.length == 1) {
				var currentIndex = indices[0];
			}
			callback(null, currentIndex);
		});
	},

	// reindex the whole index by creating a new index with updated mappings,
	// copying the documents from the current index and setting the alias when done
	reindex: function(callback) {

		indicesApi.retrieveCurrentIndex(indexName, function(err, currentIndex) {
			if (err) return callback(err, null);

			// set new index accordingly
			var newIndex = indexName + "_2"
			if (currentIndex == indexName + "_2") {
				var newIndex = indexName + "_1";
			}

			// delete new index (if it already exists)
			client.indices.delete({ index: newIndex }, function(err, res) {
				console.log("Deleted index", newIndex, res);
				// create new index
				client.indices.create({ index: newIndex }, function(err, res) {
					if (err) return callback(err, null);
					console.log("Created index", newIndex, res);
					indicesApi.updateMappings(newIndex, function(err, res) {
						if (err) return callback(err, null);
						console.log("Updated mappings", res);
						indicesApi.copyIndex(currentIndex, newIndex, "1900-01-01", function(err, res) {
							if (err) return callback(err, null);
							console.log("Copied index", currentIndex, newIndex);
							client.indices.deleteAlias(
									{ index: currentIndex, name: indexName}, function(err, res) {
								if (err) return callback(err, null);
								console.log("Deleted alias", res);
								client.indices.putAlias({ index: newIndex, name: indexName }, function(err, res) {
									if (err) return callback(err, null);
									console.log("Added alias", res);
									return callback(null, { success: true, currentIndex: currentIndex });
								});
							})
						});
					});					
				});
			});

		});
	},

	// reindex current index documents to new index
	copyIndex: function(sourceIndex, targetIndex, lastIndexTime, callback) {

		var currentIndexTime = new Date();

		var esReq = {
			index: sourceIndex,
			scroll: '1m',
			body: {
				query: {
	        		range: {
	            		modified: {
			                gte: lastIndexTime,
			                lt: currentIndexTime
	            		}
			        }
			    },
			}
		};
		console.log("Scroll query", JSON.stringify(esReq, null, 4));
		var count = 0;
		client.search(esReq, function getMoreUntilDone(err, res) {
			if (err) return callback(err, null);
			console.log("Scrolling", res);
			if (res.hits.total == 0) return callback(null, true);
			var bulk = [];
			res.hits.hits.forEach(function(hit) {
				bulk.push({ index:  { _index: targetIndex, _type: hit._type, _id: hit._id } });
				bulk.push(hit._source);
				count++;
			});
			client.bulk({ body: bulk }, function(err, bulkRes) {
				console.log("Bulk index result", bulkRes);
				if (err) return callback(err, null);
				if (res.hits.total > count) {
					client.scroll({ scrollId: res._scroll_id, scroll: '1m' }, getMoreUntilDone);
				} else {
					client.clearScroll({ scrollId: res._scroll_id });
					// repeform copy with new lastIndexTime to ensure new documents are copied
					indicesApi.copyIndex(sourceIndex, targetIndex, currentIndexTime, callback);
				}
			});
		});

	},

	// update mappings for all types
	updateMappings: function(index, callback) {
		var promises = [];
		types.forEach(function(type) {
			promises.push(client.indices.putMapping({
				index: index, type: type, body: mappings[type]
			}));
		});
		Promise.all(promises).then(function(res) {
			callback(null, res);
		}).catch(function(err) {
			callback(err, null)
		});
	},

	// reload mappings from file system
	reloadMappings: function() {
		types.forEach(function(type) {
			var path = '../../config/types/' + type + '/mapping';
			delete require.cache[require.resolve(path)];
			mappings[type] = require(path);
		});
	}

};

module.exports = {
	index: index,
	get: get,
	create: create,
	delete: remove,
	search: search,
	indices: indicesApi
};