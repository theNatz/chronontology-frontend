'use strict';

var SearchService = function($http, $q) {

	this.search = function(query) {

		var deferred = $q.defer();

		var from = query.from ? '&from=' + query.from : "";
		var size = query.size ? '&size=' + query.size : "";
		var facetlist = "&facet=resource.provenance&facet=resource.types"
		var facetvalue = query.fq ? '&fq=resource.' + query.fq : "";
		var uri = '/data/period/?q=' + query.q + from + size + facetlist + facetvalue;
		$http.get(uri).success(function(result) {
			deferred.resolve(result);
		}).error(function() {
			deferred.reject();
		});

		return deferred.promise;
	}

}

angular.module('chronontology.services').service('searchService',
	["$http", "$q", SearchService]);
