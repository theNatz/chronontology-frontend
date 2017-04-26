'use strict';

angular.module('chronontology.controllers')

.controller("PeriodController", function($scope, $location, $routeParams, $http, $sce, chronontologySettings, authService) {

	// possible relations
	// (labels are now in transl8 keys "relation_isSenseOf" etc.)
	$scope.internalRelations = chronontologySettings.internalRelations;
	$scope.gazetteerRelations = chronontologySettings.gazetteerRelations;
	$scope.allenRelations = chronontologySettings.allenRelations;

	$scope.internalAndAllenRelations = 
		chronontologySettings.internalRelations
		.concat(chronontologySettings.allenRelations);

	// store related periods, should be a central app-wide cache
	$scope.relatedDocuments = {};
	$scope.relatedDocuments.derived = {};

	$http.get('/data/period/' + $routeParams.id).success( function(result) {

		$scope.activeTab = 'info';
		$scope.document = result;
		$scope.period = result.resource;
		$scope.authService = authService;

		var geoFrameUrl = chronontologySettings.geoFrameBaseUri + "?uri=" + chronontologySettings.baseUri;
		$scope.geoFrameUrl = $sce.trustAsResourceUrl(geoFrameUrl + "/period/" + result.resource.id);

		// note: for(var relation in $scope.internalAndAllenRelations) would yield 0, 1, 2, ...
		for (var i in $scope.internalAndAllenRelations) {
			var relation = $scope.internalAndAllenRelations[i];

			$scope.relatedDocuments[relation] = [];
			if($scope.period.relations[relation]) $scope.period.relations[relation].forEach(function(periodUri) {
				(function(relation) {
					$http.get('/data/period/'+periodUri).success(function(result) {
						$scope.relatedDocuments[relation].push(result);
					})
				}(relation));
			});

			$scope.relatedDocuments.derived[relation] = [];
			if($scope.document.derived.relations[relation]) $scope.document.derived.relations[relation].forEach(function(periodUri) {
				(function(relation) {
					$http.get('/data/period/'+periodUri).success(function(result) {
						$scope.relatedDocuments.derived[relation].push(result);
					})
				}(relation));
			});
		}
		
		$http.get('/data/period/?size=1000&q=provenance:' + $scope.period.provenance).success( function(result) {
			$scope.provenancePeriods = result.results;
		});

	});

	$scope.exportJSON = function() {
		var JSONexport = angular.toJson($scope.document, true);
		var blob = new Blob([JSONexport], {type: "text/plain;charset=utf-8"});
		saveAs(blob, 'period-' + $scope.period.id + ".json");
	};

	$scope.savePeriod = function(updatedPeriod) {

        $scope.period = angular.copy(updatedPeriod);
        $scope.document.resource = $scope.period;
        $http.put("/data/period/" + $scope.period.id, JSON.stringify($scope.document))
			.success(function (data) {
				console.log("success");
				console.dir(data);

				$scope.activeTab = 'info';
		})
			.error(function (data) {
                console.log("error");
                console.dir(data);
		});
    }
});
