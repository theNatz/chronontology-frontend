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

	$http.get('/data/period/?q=' + $location.search()['q']).success(function(result) {
		$scope.periods = result.results;
	});

})

.controller("PeriodController", function($scope, $location, $routeParams, $http, periodUtils) {

	$http.get('/data/period/' + $routeParams.id).success( function(result) {
		
		$scope.period = result;
		
		if (result.fallsWithin) {
			$http.get('/data/'+result.fallsWithin).success(function(result) {
				$scope.fallsWithin = result;
			});
		}

		if (result.meetsInTimeWith) {
			$http.get('/data/'+result.meetsInTimeWith).success(function(result) {
				$scope.meetsInTimeWith = result;
			});
		}

		if (result.isMetInTimeBy) {
			$http.get('/data/'+result.isMetInTimeBy).success(function(result) {
				$scope.isMetInTimeBy = result;
			});
		}
		
		$http.get('/data/period/', { params: { q: "fallsWithin:\"" + result['@id'] + "\"", size: 1000 } }).success( function(result) {
			$scope.contains = periodUtils.buildTree(result.results);
		});

	});

	$scope.save = function() {
		$http.put('/data' + $scope.period['@id'], $scope.period).success(function(result) {
			$scope.period = result;
		});
	};

})

.controller("ThesaurusController", function($scope, $routeParams, $http) {
		
	$http.get('/data/period/?size=1000&q=provenance:' + $routeParams.provenance).success( function(result) {
		$scope.periods = result.results;
	});

})
;
