'use strict';

angular.module('chronontology.controllers')

.controller("SearchController", function($scope, $location, chronontologySettings) {

    $scope.getRegion = function(doc) {

        if (!doc.derived) {
            return '-';
        } else {
            for (var i in chronontologySettings.gazetteerRelations) {
                var relation = chronontologySettings.gazetteerRelations[i];
                if (doc.derived[relation]) {
                    return doc.derived[relation][0].prefName.title;
                }
            }
        }
        return '-';
    }

})
