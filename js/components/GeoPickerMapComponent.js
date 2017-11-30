angular.module('chronontology.components')
.controller('GeoPickerMapModalController', function($uibModalInstance, $scope) {

    var _this = this;

    $scope.view = 'map';
    $scope.gazetteerType = 'geonames';

    this.setView = function(view) {
        $scope.view = view;
    }

    this.loadEmptyMap = function() {
        $scope.datasource = $scope.gazetteerType;
        console.log("GeoPickerMapModalController",$scope.datasource);
    };

    this.selectPlace = function(place) {
        $uibModalInstance.close(place);
    };

});

function GeoPickerMapController($http, $uibModal) {

    var _this = this;

    this.openModal = function() {
        var modal = $uibModal.open({
			templateUrl: "geopickerMap_modal.html",
			controller: "GeoPickerMapModalController",
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
    .component('geopickermap',{
        templateUrl: '../../partials/geo/pickerMap.html',
        bindings: {
            onPlaceSelected: '&'
        },
        controller: GeoPickerMapController
    });
