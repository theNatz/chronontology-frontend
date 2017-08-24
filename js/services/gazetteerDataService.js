/**
 * Created by Simon Hohl on 16.06.17.
 */

'use strict';

var GazetteerDataService = function($http, chronontologySettings) {
    this.matchIdFromUriPattern = /\d+$/;
    this.getById = function(gazId, success) {
        $http.get(
            chronontologySettings.gazetteerBaseUri + '/doc/' + gazId + '.json'
        ).then(function successfn(result){
            return success(result.data);
        });
    };

    this.getByUri = function(gazUri, success) {
        this.getById(
            gazUri.match(this.matchIdFromUriPattern),
            function(result) {
                return success(result);
            }
        )
    }
};

angular.module('chronontology.services').service('gazetteerDataService', ["$http", "chronontologySettings", GazetteerDataService]);