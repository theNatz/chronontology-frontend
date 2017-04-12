/**
 * Created by Simon Hohl on 12.04.17.
 */

angular.module('chronontology.components')
    .component('periodEdit',{
        templateUrl: '../../partials/period/edit.html',
        bindings:
            {
                period: '=',
                internalRelations: '=',
                gazetteerRelations: '=',
                document: '=',
                relatedDocuments: '='
            }
    });
