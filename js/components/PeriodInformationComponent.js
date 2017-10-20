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

            this.hasRelationsInResource = function(){
                return period.hasOwnProperty('relations');
            }
            this.hasRelationsInDerived = function(){
                return (document.hasOwnProperty('derived') &&
                        document.derived.hasOwnProperty('relations'));
            }
            this.hasGazetteerRelationsInDerived = function(){
                if (!document.hasOwnProperty('derived')) {
                    return false;
                }
                for (var i in $scope.gazetteerRelationTypes) {
                    var currentType = $scope.gazetteerRelationTypes[i];
                    if (document.hasOwnProperty(currentType)) {
                        return true;
                    }
                }
                return false;
            }
            this.hasTimespanInDerived = function(){
                return (document.hasOwnProperty('derived') &&
                        document.derived.hasOwnProperty('hasTimespan'));
                return ();
            }
            this.hasDerivedInformation = function(){
                return (this.hasGazetteerRelationsInDerived() ||
                        this.hasTimespanInDerived() ||
                        this.hasRelationsInDerived());
            }

        }
    });
