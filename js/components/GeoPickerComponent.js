function GeoPickerController($http) {

    var _this = this;
    var popupinfo = [];
    // set div to loading
    document.getElementById("map").innerHTML = "<h1 class='maploading'>map is loading...</h1>";

    this.loadPlaces = function(bbox) {
        $http.get("/spi/place?bbox=" + bbox, {
            headers: { 'Authorization': undefined }
        }).success(function(geojson){
            _this.places = geojson;
            // init map
        });
    };

    this.loadPlace = function(type, placeId) { // load on select by map or id
        $http.get("/spi/place/"+ type + "/" + placeId, {
            headers: { 'Authorization': undefined }
        }).success(function(geojson){
            _this.onPlaceSelected(geojson);
        });
    };

}

angular.module('chronontology.components')
    .component('geomap',{
        templateUrl: '../../partials/geo/picker.html',
        bindings: {
            onPlaceSelected: '&'
        },
        controller: GeoPickerController
    });
