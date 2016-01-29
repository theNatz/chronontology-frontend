'use strict';

angular.module('chronontology.filters', [])

	.filter('isoDate', function() {
		return function(dateString) {
			return new Date(dateString);
		}
	})