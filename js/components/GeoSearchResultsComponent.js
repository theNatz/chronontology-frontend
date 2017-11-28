function GeoSearchResultsController($scope, $location, $routeParams, $http, $sce, chronontologySettings, $filter) {

    var _this = this;

    _this.loading = false;
    _this.empty = false;

    this.$onChanges = function() {
        this.initMap();
        this.loadData();
    };

    this.loadData = function() {
        _this.loading = true;
        _this.empty = true;
        $http.get(_this.datasource, {
                headers: { 'Authorization': undefined }
        }).then(function success(geojson){
            _this.loading = false;
            _this.geojson = geojson.data;
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

    this.initMap = function() {
        // init map
        _this.mapY = 50.1287762;
        _this.mapX = -5.4532871;
        _this.markersArea = 0;
        _this.mapZoom = 8;
        _this.baseLayer = L.tileLayer('http://{s}.tiles.mapbox.com/v3/isawnyu.map-knmctlkh/{z}/{x}/{y}.png', {
            maxZoom: 15,
            attribution: "<a href='javascript:alert(\"Tiles (c) MapBox (http://mapbox.com), Data (c) OpenStreetMap (http://www.openstreetmap.org) and contributors, CC-BY-SA, Tiles and Data (c) 2013 AWMC (http://www.awmc.unc.edu) CC-BY-NC 3.0 (http://creativecommons.org/licenses/by-nc/3.0/deed.en_US)\");'>Attribution</a>"
        });
        _this.map = L.map("map3", {
            fullscreenControl: {pseudoFullscreen: false},
            center: [_this.mapY, _this.mapX],
            zoom: _this.mapZoom,
            layers: [_this.baseLayer]
        });
        // add scale
        L.control.scale().addTo(_this.map);
    };

    this.initPlaces = function(geojson) {

        // cluster
        _this.markers = null;
		_this.markers = L.markerClusterGroup();

        // add markers and polygons
        _this.orangeBowlIcon = L.icon({iconUrl: 'img/Icone_Boule_Orange.png', iconSize: [30, 30], iconAnchor: [15, 15]}),
        _this.marker = L.geoJson(geojson, {
          onEachFeature: _this.onEachFeature,
          pointToLayer: function (feature, latlng) {
              return L.marker(latlng, {icon: _this.orangeBowlIcon, name: feature.properties.names.prefName.name});
            }
        });
        _this.markers.addLayer(_this.marker);
        // add marker as layer
        _this.map.addLayer(_this.markers);
        // init search
        _this.controlSearch = new L.Control.Search({
    		position:'topleft',
    		layer: _this.markers,
            initial: false,
            propertyName: 'name',
    		marker: false,
            zoom: 13
    	});
        _this.controlSearch.on('search:locationfound', function(e) {
    		e.layer.openPopup();
    	});
        _this.map.addControl(_this.controlSearch);
        // calc layer center
        _this.mapY = _this.marker.getBounds().getCenter().lat;
        _this.mapX = _this.marker.getBounds().getCenter().lng;
        // set map
        _this.map.setView([_this.mapY, _this.mapX], _this.mapZoom);
        // zoom to bounds
        _this.map.fitBounds(_this.marker.getBounds());

        if (_this.map.tap) _this.map.tap.enable();
        document.getElementById('map3').style.cursor='grab';
    }

    this.onEachFeature = function(feature, layer) {
        var popupContent = "name: " + feature.properties.names.prefName.name + "<br>" + "uri: <a href='" + feature.properties["@id"] + "' target='_blank'>" + feature.properties["@id"] + "</a>";
		if (feature.properties && feature.properties.popupContent) {
			popupContent += feature.properties.popupContent;
		}
		layer.bindPopup(popupContent);
    };

}

angular.module('chronontology.components')
    .component('geosearchresults',{
        templateUrl: '../../partials/geo/searchResults.html',
        bindings: {
            datasource: '@datasource'
        },
        controller: GeoSearchResultsController
    });
