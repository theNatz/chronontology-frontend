'use strict';

angular.module('chronontology.controllers')

.controller("SearchController", function($scope, $location, searchService, chronontologySettings) {


    $scope.query = $location.search();
    if (!$scope.query.from) $scope.query.from = 0;
    if (!$scope.query.size) $scope.query.size = 20;

    searchService.search($scope.query).then(function(result){
        $scope.periods = result.results;
        $scope.total = result.total;
    });

    $scope.previous = function(){
        return $scope.query.from - $scope.query.size;
    }
    $scope.next = function(){
        return parseInt($scope.query.from) + parseInt($scope.query.size);
    }

    $scope.getRegion = function(doc) {

        if (!doc.related) {
            return '-';
        }
		for (var i in chronontologySettings.gazetteerRelations) {
			var relation = chronontologySettings.gazetteerRelations[i];
			if (doc.resource[relation]) {
				for (var j in doc.resource[relation]) {
					var uri = doc.resource[relation][j];
					if (doc.related[uri]) {
						return doc.related[uri].prefName.title;
					}
				}
			}
		}
        return '-';
    }

})
