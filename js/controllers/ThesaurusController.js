'use strict';

angular.module('chronontology.controllers')

.controller("ThesaurusController", function($scope, $routeParams, $http) {
		
	$http.get('/data/period/?size=1000&q=provenance:' + $routeParams.provenance).success( function(result) {
		$scope.periods = result.results;
	});
})
