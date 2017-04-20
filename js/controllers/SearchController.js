'use strict';

angular.module('chronontology.controllers')

.controller("SearchController", function($scope, $location) {

    $scope.getRegion = function(period) {

        if (!period.derived) {
            return '-';
        } else if(period.derived.namedAfter) {
            return period.derived.namedAfter[0].prefName.title;
        } else if(period.derived.hasCoreRegion) {
            return period.derived.hasCoreRegion[0].prefName.title;
        } else if(period.derived.spatiallyPartOfRegion) {
            return period.derived.spatiallyPartOfRegion[0].prefName.title;
        } else {
            return '-';
        }
    }

})
