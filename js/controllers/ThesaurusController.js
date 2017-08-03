'use strict';

angular.module('chronontology.controllers')

.controller("ThesaurusController", function($scope, $routeParams, $http) {

	var relevantParts =
		'resource.id,resource.names,resource.hasTimespan,'+
		'resource.relations.isPartOf,resource.relations.hasPart,'+
		'resource.relations.follows,resource.relations.isFollowedBy';

	$http.get('/data/period/?size=10000&q=resource.provenance:' + $routeParams.provenance + '&part='+relevantParts).success( function(result) {
		$scope.periods = result.results;
	});
})
