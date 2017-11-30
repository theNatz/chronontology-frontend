angular.module('chronontology.components')
.controller('GeoPickerModalController', function($uibModalInstance, $scope) {

    var _this = this;

    $scope.view = 'list';
    $scope.gazetteerType = 'dai';

    this.setView = function(view) {
        $scope.view = view;
    }

    this.loadTable = function() {
        $scope.datasource = "/spi/place"
         + "?q=" + $scope.query + "&type=" + $scope.gazetteerType;
    };

    this.selectPlace = function(place) {
        $uibModalInstance.close(place);
    };

});

function GeoPickerController($http, $uibModal) {

    var _this = this;

    this.openModal = function() {
        var modal = $uibModal.open({
			templateUrl: "geopicker_modal.html",
			controller: "GeoPickerModalController",
			bindToController: true,
			size: 'lg',
            controllerAs: '$ctrl'
		});
        modal.result.then(function(place) {
            _this.selectedItem = place;
            _this.onPlaceSelected({place: place});
		});
    }

    _this.deselectPlace = function() {
        _this.selectedItem = undefined;
        _this.onPlaceSelected({place: undefined});
    };

}

angular.module('chronontology.components')
    .component('geopicker',{
        templateUrl: '../../partials/geo/picker.html',
        bindings: {
            onPlaceSelected: '&'
        },
        controller: GeoPickerController
    });
