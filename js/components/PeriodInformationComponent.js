/**
 * Created by Simon Hohl on 11/04/2017.
 */

angular.module('chronontology.components')
    .component('periodInformation',{
        templateUrl: '../../partials/period/information.html',
        bindings:
        {
            period: '<',
            internalRelations: '<',
            gazetteerRelations: '<',
            document: '<',
            relatedDocuments: '<'
        }
    });
