angular.module('chronontology.components')
    .component('periodInformation',{
        templateUrl: '../../partials/period/information.html',
        bindings:
        {
            period: '<',
            internalRelationTypes: '<',
            allenRelationTypes: '<',
            gazetteerRelationTypes: '<',
            document: '<',
            resourceCache: '<'
        },
        controller: function (authService) {
            this.authService = authService
        }
    });
