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

.controller("SearchController", function($scope, $location) {

})

.controller("PeriodController", function($scope, $location, $routeParams, $http) {

	$http.get('/data/period/' + $routeParams.id).success( function(result) {

		$scope.period = result;

		if (result.resource.fallsWithin) {
			$http.get('/data'+result.resource.fallsWithin).success(function(result) {
				$scope.fallsWithin = result;
			});
		}

		if (result.resource.derived.meetsInTimeWith) {
			$http.get('/data'+result.resource.derived.meetsInTimeWith).success(function(result) {
				$scope.meetsInTimeWith = result;
			});
		}

		if (result.resource.derived.isMetInTimeBy) {
			$http.get('/data'+result.resource.derived.isMetInTimeBy).success(function(result) {
				$scope.isMetInTimeBy = result;
			});
		}

		$scope.contains = [];
		angular.forEach(result.resource.contains, function(id) {
			$http.get('/data' + id).success(function(result) {
				$scope.contains.push(result);
			});
		});

		$http.get('/data/period/?size=1000&q=provenance:' + $scope.period.resource.provenance).success( function(result) {
			$scope.provenancePeriods = result.results;
		});

	});

	$scope.save = function() {
		$http.put('/data' + $scope.period['@id'], $scope.period).success(function(result) {
			$scope.period = result;
		});
	};
	
	$scope.exportJSON = function() {
		var JSONexport = angular.toJson($scope.period, true);
		var blob = new Blob([JSONexport], {type: "text/plain;charset=utf-8"});
		saveAs(blob, $scope.period['@id'] + ".json");
	}

})

.controller("ThesaurusController", function($scope, $routeParams, $http) {
		
	$http.get('/data/period/?size=1000&q=provenance:' + $routeParams.provenance).success( function(result) {
		$scope.periods = result.results;
	});

})
;
