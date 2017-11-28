angular.module('chronontology.components')
.controller('GeoPickerModalController', function($uibModalInstance) {

        this.loadPlaces = function(bbox) {
            $http.get("/spi/place?bbox=50.082665;8.161050;50.082665;8.371850;49.903887;8.161050;49.903887;8.371850&type=getty", {
                headers: { 'Authorization': undefined }
            }).then(function success(geojson){
                 console.log(geojson);
                _this.places = geojson.data;
            });
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
		modal.result.then(function(item) {
            // TODO: set URI in textfield
            //_this.onPlaceSelected({place: item});
		});
    }

}

angular.module('chronontology.components')
    .component('geopicker',{
        templateUrl: '../../partials/geo/picker.html',
        bindings: {
            onPlaceSelected: '&'
        },
        controller: GeoPickerController
    });
