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
        var html = "";
        var mode = "";
        if (geojson.metadata) {
            if (geojson.metadata.searchstring) {
                mode = "q";
            } else {
                mode = "bbox";
            }
        } else {
            mode = "resource";
        }
        if (mode==="q") {
            html += "<p><i>"+geojson.features.length+" Ergebnisse, q="+geojson.metadata.searchstring+"</i></p>";
        } else if (mode==="bbox") {
            html += "<p><i>"+geojson.features.length+" Ergebnisse</i></p>";
        } else if (mode==="resource") {
            html += "<p><i>1 Ergebnisse</i></p>";
        }
        html += "<div class='table-wrapper'>";
        html += "<table class='widget' id='searchresultlist'>";
        html += "<thead>";
        html += "<tr>";
        if (mode==="q") {
            html += "<th>prefName</th>";
            html += "<th data-sort-default>n.lev.</th>";
        } else {
            html += "<th data-sort-default>prefName</th>";
        }
        html += "<th>URL</th>";
        html += "</tr>";
        html += "</thead>";
        html += "<tbody>";
        if (mode==="q" || mode==="bbox") {
            for (var item in geojson.features) {
                html += "<tr>";
                html += "<td >"+geojson.features[item].properties.names.prefName.name+"</td>";
                if (mode==="q") {
                    html += "<td>"+geojson.features[item].properties.similarity.normalizedlevenshtein+"</td>";
                }
                html += "<td><a href='"+geojson.features[item].properties["@id"]+"' target='_blank'>"+geojson.features[item].properties.gazetteertype+":"+geojson.features[item].properties.gazetteerid+"</a></td>";
                html += "</tr>";
            }
        } else {
            html += "<tr>";
            html += "<td >"+geojson.properties.names.prefName.name+"</td>";
            html += "<td><a href='"+geojson.properties["@id"]+"' target='_blank'>"+geojson.properties.gazetteertype+":"+geojson.properties.gazetteerid+"</a></td>";
            html += "</tr>";
        }
        html += "</tbody>";
        html += "</table>";
        html += "</div>";
        document.getElementById("map4").innerHTML = html;
        new Tablesort(document.getElementById('searchresultlist'));
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
