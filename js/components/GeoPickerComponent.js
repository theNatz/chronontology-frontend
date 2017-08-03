function GeoPickerController($http) {

    var _this = this;

    this.loadPlaces = function(bbox) {
        // should set to "/spi/place?bbox=" + bbox
        $http.get("/spi/GetDummy?multi=true", {
            headers: { 'Authorization': undefined }
        }).success(function(geojson){
            _this.places = geojson;
            // init map
        });
    };

    this.loadPlace = function(type, placeId) { // load on select by map or id
        // "/spi/place/"+ type + "/" + placeId
        $http.get("/spi/GetDummy", {
            headers: { 'Authorization': undefined }
        }).success(function(geojson){
            _this.onPlaceSelected(geojson);
        });
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
