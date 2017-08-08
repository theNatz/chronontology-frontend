'use strict';

angular.module('chronontology.controllers')

.controller("SearchController", function($scope, $location, searchService, chronontologySettings) {


    $scope.query = $location.search();
    if (!$scope.query.from) $scope.query.from = 0;
    if (!$scope.query.size) $scope.query.size = 10;

    searchService.search($scope.query).then(function(result){
        $scope.periods = result.results;
        $scope.total = result.total;
        $scope.facets = result.facets;
    });

    $scope.facetList = chronontologySettings.facetList;


    $scope.getPrevious = function(){
        return $scope.query.from - $scope.query.size;
    }
    $scope.getNext = function(){
        return parseInt($scope.query.from) + parseInt($scope.query.size);
    }

    $scope.getCurrentPage = function(){
        return $scope.query.from / $scope.query.size + 1;
    }
    $scope.getTotalPages = function(){
        return Math.ceil($scope.total / $scope.query.size);
    }

    $scope.getFacetValues = function(){
        // aus der Frontend-URI: ohne "resource."
        var fq = $scope.query.fq;
        if (fq == null) return "";
        if (typeof fq === 'string') return "&fq="+fq;
        return "&fq=" + fq.join("&fq=");
    }

    $scope.addResource = function(text){
        return "resource." + text;
    }

    $scope.getRegion = function(doc) {

        if (!doc.related) {
            return '-';
        }
		for (var i in chronontologySettings.gazetteerRelationTypes) {
			var relation = chronontologySettings.gazetteerRelationTypes[i];
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
