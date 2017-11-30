function GeoSearchResultsListController($scope, $location, $routeParams, $http, $sce, chronontologySettings, $filter) {

    var _this = this;

    _this.loading = false;
    _this.showLevenshtein = false;
    _this.results = [];

    new Tablesort(document.getElementById('searchresultlist'));

    this.$onChanges = function() {
        this.loadData();
    };

    this.loadData = function() {
        _this.loading = true;
        _this.results = [];

        $http.get(_this.datasource, {
                headers: { 'Authorization': undefined }
        }).then(function success(geojson){
            _this.loading = false;
            if (geojson.data.geometry && geojson.data.geometry.type) {
                _this.results = [geojson.data];
            } else if (geojson.data.features && geojson.data.features.length > 1) {
                _this.results = geojson.data.features;
            }
            if (geojson.data.metadata.searchstring) {
                _this.showLevenshtein = true;
            } else {
                _this.showLevenshtein = false;
            }
        }, function error(err) {
            console.warn(err) // TODO show error message
        });
    };
}

angular.module('chronontology.components')
    .component('geosearchresultslist',{
        templateUrl: '../../partials/geo/searchResultsList.html',
        bindings: {
            datasource: '@datasource'
        },
        controller: GeoSearchResultsListController
    });
