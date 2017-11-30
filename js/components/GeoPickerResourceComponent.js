angular.module('chronontology.components')
.controller('GeoPickerResourceModalController', function($uibModalInstance, $scope) {

        var _this = this;

        $scope.view = 'list';
        $scope.gazetteerType = 'dai';

        this.setView = function(view) {
            $scope.view = view;
        }

        this.loadTable = function() {
            $scope.datasource = "/spi/place/"
             + $scope.gazetteerType + "/" + $scope.gazetteerId;
        };

        this.onPlaceSelected = function(item) {
            console.log(item);
        };

});

function GeoPickerResourceController($http, $uibModal) {

    var _this = this;

    this.openModal = function() {
        var modal = $uibModal.open({
			templateUrl: "geopickerResource_modal.html",
			controller: "GeoPickerResourceModalController",
			bindToController: true,
			size: 'lg',
            controllerAs: '$ctrl'
		});
		modal.result.then(function(item) {
            // TODO: set URI in textfield
            //_this.onPlaceSelected({place: item});
		});
    }

}

angular.module('chronontology.components')
    .component('geopickerresource',{
        templateUrl: '../../partials/geo/pickerResource.html',
        bindings: {
            ds: '<'
        },
        controller: GeoPickerResourceController
    });
