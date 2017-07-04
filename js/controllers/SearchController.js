'use strict';

angular.module('chronontology.controllers')

.controller("SearchController", function($scope, $location, searchService, chronontologySettings) {


    $scope.query = $location.search();
    if (!$scope.query.from) $scope.query.from = 0;
    if (!$scope.query.size) $scope.query.size = 20;

    searchService.search($scope.query).then(function(result){
        $scope.periods = result.results;
        $scope.total = result.total;
        $scope.facets = result.facets;
    });

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

    $scope.getFacetValuesExcept = function(facette, facetvalue){
        var fq = $scope.query.fq;
        var facettenwert = facette + ":" + facetvalue;
        // 1. sowieso kein Facettenwert ausgewählt?
        if (fq == null) return "";
        // 2. genau ein Facettenwert ausgewählt?
        if (typeof fq === 'string') {
            if (facettenwert === fq) {
                return "";
            } else {
                return "&fq="+fq;
            }
        }
        // 3. mehr als ein Facettenwert ausgewählt?
        if (fq.indexOf(facettenwert) > -1) {
            var fqOhne = angular.copy(fq)
            fqOhne.splice(fq.indexOf(facettenwert), 1);
            return "&fq=" + fqOhne.join("&fq=");
        } else {
            return "&fq=" + fq.join("&fq=");
        }
    }
    $scope.isFacetValueSelected = function(facette, facetvalue){
        var zusammen = facette + ":" + facetvalue;
        var fq = $scope.query.fq;
        if (fq == null) return false;
        if (typeof fq === 'string') return (zusammen === fq);
        return (fq.indexOf(zusammen) > -1);
    }

    $scope.addResource = function(text){
        return "resource." + text;
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
