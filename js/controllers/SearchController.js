'use strict';

angular.module('chronontology.controllers')

.controller("SearchController", function($scope, $location, chronontologySettings) {

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
