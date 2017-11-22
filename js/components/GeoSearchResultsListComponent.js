function GeoSearchResultsListController($scope, $location, $routeParams, $http, $sce, chronontologySettings, $filter) {

    var _this = this;

    _this.loading = false;
    _this.empty = false;

    this.$onChanges = function() {
        this.loadData();
    };

    this.loadData = function() {
        _this.loading = true;
        _this.empty = true;
        $http.get(_this.datasource, {
                headers: { 'Authorization': undefined }
        }).then(function success(geojson){
            _this.loading = false;
            if (geojson.data.geometry) {
                _this.empty = false;
                _this.initPlaces(geojson.data);
            } else if (geojson.data.features) {
                if (geojson.data.features.length > 0) {
                    _this.empty = false;
                    _this.initPlaces(geojson.data);
                }
            } else {
                _this.empty = true;
            }
        }, function error(err) {
            console.warn(err) // TODO show error message
        });
    };

    this.initPlaces = function(geojson) {
        console.log(geojson);
        var html = "";
        var mode = "";
        if (geojson.metadata.searchstring) {
            mode = "q";
        } else {
            mode = "bbox";
        }
        if (mode==="q") {
            html += "<p><i>"+geojson.features.length+" Ergebnisse, q="+geojson.metadata.searchstring+"</i></p>";
        } else {
            html += "<p><i>"+geojson.features.length+" Ergebnisse</i></p>";
        }
        html += "<table class='widget'>";
        html += "<thead class='widget'>";
        html += "<tr class='widget'>";
        html += "<th class='widget'>prefName</th>";
        if (mode==="q") {
            html += "<th class='widget'>n.lev.</th>";
        }
        html += "<th class='widget'>URL</th>";
        html += "</tr>";
        html += "</thead>";
        html += "<tbody class='widget'>";
        for (var item in geojson.features) {
            html += "<tr class='widget'>";
            html += "<td class='widget'>"+geojson.features[item].properties.names.prefName.name+"</td>";
            if (mode==="q") {
                html += "<td class='widget'>"+geojson.features[item].properties.similarity.normalizedlevenshtein+"</td>";
            }
            html += "<td class='widget'><a href='"+geojson.features[item].properties["@id"]+"' target='_blank'>"+geojson.features[item].properties.gazetteertype+":"+geojson.features[item].properties.gazetteerid+"</a></td>";
            html += "</tr>";
        }
        html += "</tbody>";
        html += "</table>";
        document.getElementById("map4").innerHTML = html;
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
