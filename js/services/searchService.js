'use strict';

var SearchService = function($http, $q) {

	this.search = function(query) {

		var deferred = $q.defer();

		var from = query.from ? '&from=' + query.from : "";
		var size = query.size ? '&size=' + query.size : "";
		var facetlist = "&facet=resource.provenance&facet=resource.types";

		// facet values in der Backend-URI: mit "resource."
		var fq = query.fq;
        if (fq == null) {
			fq = "";
		} else if (typeof fq === 'string') {
			fq = "&fq=resource."+fq;
		} else {
			fq = "&fq=resource." + fq.join("&fq=resource.");
		}

		var uri = '/data/period/?q=' + query.q + from + size + facetlist + fq;
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
