angular.module('chronontology.components')
.controller('GeoPickerResourceModalController', function($uibModalInstance, $http) {

        var _this = this;

        this.loadPlace = function(type,id) {
            $http.get("/spi/place/"+type+"/"+id, {
                headers: { 'Authorization': undefined }
            }).then(function success(geojson){
                var uri = geojson.data.properties["@id"];
                console.log("URI",uri);
                _this.onPlaceSelected({place: uri});
                $uibModalInstance.close();
            });
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
            onPlaceSelected: '&'
        },
        controller: GeoPickerResourceController
    });
