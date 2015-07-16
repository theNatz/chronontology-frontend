'use strict';

angular.module('chronontology.controllers', [])

.controller('SearchFormController', function($scope, $location) {

	$scope.search = function(fq) {
		if ($scope.q) {
			var url = '/search?q=' + $scope.q;
			$scope.q = null;
			$location.url(url);
		}
	}

})

.controller("SearchController", function($scope, $location, $http) {

	$http.get('/period/?q=' + $location.search()['q']).success(function(result) {
		$scope.periods = result.results;
	});

})

.controller("PeriodController", function($scope, $location, $routeParams, $http, periodUtils) {

	$http.get('/period/' + $routeParams.id).success( function(result) {
		
		$scope.period = result;
		
		if (result.fallsWithin) {
			$http.get(result.fallsWithin).success(function(result) {
				$scope.fallsWithin = result;
			});
		}

		if (result.meetsInTimeWith) {
			$http.get(result.meetsInTimeWith).success(function(result) {
				$scope.meetsInTimeWith = result;
			});
		}

		if (result.isMetInTimeBy) {
			$http.get(result.isMetInTimeBy).success(function(result) {
				$scope.isMetInTimeBy = result;
			});
		}
		
		$http.get('/period', { params: { q: "fallsWithin:\"" + result['@id'] + "\"", size: 1000 } }).success( function(result) {
			$scope.contains = periodUtils.buildTree(result.results);
		});

	});

})

.controller("ThesaurusController", function($scope, $routeParams, $http) {
		
	$http.get('/period/?size=1000&q=provenance:' + $routeParams.provenance).success( function(result) {	
		$scope.periods = result.results;
	});

})
;
