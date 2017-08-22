'use strict';

angular.module('chronontology.filters')

    .filter('getRegion',['chronontologySettings', function(chronontologySettings) {

        return function(doc) {

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
    }]);
