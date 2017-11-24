angular.module('chronontology.components')
.controller('GeoPickerMapModalController', function($uibModalInstance) {

        var _this = this;

        this.loadPlace = function() {
            $http.get("/spi/place?bbox=50.082665;8.161050;50.082665;8.371850;49.903887;8.161050;49.903887;8.371850&type=getty", {
                headers: { 'Authorization': undefined }
            }).then(function success(geojson){
                var uri = geojson.data.properties["@id"];
                console.log(uri);
            });
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
		modal.result.then(function(item) {
			_this.onPlaceSelected({place: item});
		});
    }

}

angular.module('chronontology.components')
    .component('geopickermap',{
        templateUrl: '../../partials/geo/pickerMap.html',
        bindings: {
            onPlaceSelected: '&'
        },
        controller: GeoPickerMapController
    });
