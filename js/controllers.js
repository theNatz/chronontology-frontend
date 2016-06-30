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

.controller("PeriodController", function($scope, $location, $routeParams, $http, $sce, chronontologySettings) {

	// possible relations mapped to labels
	$scope.relations = chronontologySettings.relations;

	// store related periods, should be a central app-wide cache
	$scope.relatedDocuments = {};

	$http.get('/data/period/' + $routeParams.id).success( function(result) {

		$scope.document = result;
		$scope.period = result.resource;

		var geoFrameUrl = chronontologySettings.geoFrameBaseUri + "?uri=" + chronontologySettings.baseUri;
		$scope.geoFrameUrl = $sce.trustAsResourceUrl(geoFrameUrl + result.resource['@id']);

		for(var relation in $scope.relations) {
			var label = $scope.relations[relation];
			$scope.relatedDocuments[relation] = [];
			if(result.resource[relation]) result.resource[relation].forEach(function(periodUri) {
				(function(relation) {
					$http.get('/data'+periodUri).success(function(result) {
						$scope.relatedDocuments[relation].push(result);
					})
				}(relation));
			});
		}

		$http.get('/data/period/?size=1000&q=provenance:' + $scope.period.provenance).success( function(result) {
			$scope.provenancePeriods = result.results;
		});

	});
	
	$scope.exportJSON = function() {
		var JSONexport = angular.toJson($scope.period, true);
		var blob = new Blob([JSONexport], {type: "text/plain;charset=utf-8"});
		saveAs(blob, $scope.period.resource['@id'] + ".json");
	}

})

.controller("ThesaurusController", function($scope, $routeParams, $http) {
		
	$http.get('/data/period/?size=1000&q=provenance:' + $routeParams.provenance).success( function(result) {
		$scope.periods = result.results;
	});
})

.controller('ContactController', ['$scope','$http', function($scope, $http) {

	$scope.success = false;
	$scope.error = "";

	$scope.submit = function () {
		//console.log($scope.usrData);
        $http.post('/data/mail', $scope.usrData);
	}

}])
;
