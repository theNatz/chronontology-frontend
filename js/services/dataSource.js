'use strict';

var DataSource = function($location, $http) {

	this.get = function(descriptor, success) {
		var from = descriptor.index - 1;
		var size = descriptor.count;
		var query = $location.search()['q'];
		if (from + size <= 0) {
			success([]);
		} else {
			if (from < 0) {
				size = size + from;
				from = 0;
			}
			var uri = '/data/period/?' + query + '&from=' + from + '&size=' + size;
			$http.get(uri).success(function(result) {
				success(result.results);
			});
		}
	}

}

angular.module('chronontology.services').service('dataSource', ["$location", "$http", DataSource]);