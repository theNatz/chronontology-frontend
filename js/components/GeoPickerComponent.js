angular.module('chronontology.components')
.controller('GeoPickerModalController', function($uibModalInstance) {

        this.loadPlaces = function(bbox) {
            // should set to "/spi/place?bbox=" + bbox
            $http.get("/spi/GetDummy?multi=true", {
                headers: { 'Authorization': undefined }
            }).success(function(geojson){
                _this.places = geojson;
                // init map
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
			_this.onPlaceSelected({place: item});
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
