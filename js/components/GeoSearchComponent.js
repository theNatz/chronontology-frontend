function GeoSearchController($scope, $location, $routeParams, $http, $sce, chronontologySettings, $filter) {

    var _this = this;
    var popupinfo = [];

    _this.loading = true;
    _this.empty = false;

    this.$onChanges = function(changes) {
        if (changes.selectedPeriodId && _this.selectedPeriodId) {
            this.initMap();
            _this.loadData();
        }
    };

    this.loadData = function() {
        $http.get("/spi/place?bbox=50.082665;8.161050;50.082665;8.371850;49.903887;8.161050;49.903887;8.371850&type=dai", {
                headers: { 'Authorization': undefined }
        }).then(function success(geojson){
            console.log(geojson.data);
            _this.loading = false;
            _this.geojson = geojson.data;
            console.log(geojson.data.features.length);
            if (geojson.data.features.length > 0) _this.initPlaces(geojson.data);
            else _this.empty = true;
        }, function error(err) {
            console.warn(err) // TODO show error message
        });
    };

    this.initMap = function() {

        // init map
        _this.mapY = 0;
        _this.mapX = 0;
        _this.markersArea = 0;
        _this.mapZoom = 1;
        _this.baseLayer = L.tileLayer('http://{s}.tiles.mapbox.com/v3/isawnyu.map-knmctlkh/{z}/{x}/{y}.png', {
            maxZoom: 15,
            attribution: "<a href='javascript:alert(\"Tiles (c) MapBox (http://mapbox.com), Data (c) OpenStreetMap (http://www.openstreetmap.org) and contributors, CC-BY-SA, Tiles and Data (c) 2013 AWMC (http://www.awmc.unc.edu) CC-BY-NC 3.0 (http://creativecommons.org/licenses/by-nc/3.0/deed.en_US)\");'>Attribution</a>"
        });
        _this.map = L.map("map2", {
            fullscreenControl: {pseudoFullscreen: false},
            center: [_this.mapY, _this.mapX],
            zoom: _this.mapZoom,
            layers: [_this.baseLayer]
        });
        // disable interaction
        _this.map.dragging.disable();
        _this.map.touchZoom.disable();
        _this.map.doubleClickZoom.disable();
        _this.map.scrollWheelZoom.disable();
        _this.map.boxZoom.disable();
        _this.map.keyboard.disable();
        if (_this.map.tap) _this.map.tap.disable();
        document.getElementById('map').style.cursor = 'default';

    };

    this.initPlaces = function(geojson) {

        // add scale
        L.control.scale().addTo(_this.map);

        // cluster
        _this.markers = null;
		_this.markers = L.markerClusterGroup();

        // add markers and polygons
        _this.marker = L.geoJson(geojson, {
          onEachFeature: _this.onEachFeature,
          pointToLayer: function (feature, latlng) {
              return L.circleMarker(latlng, {radius: 10, fillColor: "blue", color: "blue", weight: 1, opacity: 1, fillOpacity: 1});
            }
        });
        _this.markers.addLayer(_this.marker);
        // add marker as layer
        _this.map.addLayer(_this.markers);
        // calc layer center
        _this.mapY = _this.marker.getBounds().getCenter().lat;
        _this.mapX = _this.marker.getBounds().getCenter().lng;
        // set map
        _this.map.setView([_this.mapY, _this.mapX], _this.mapZoom);
        // zoom to bounds
        _this.map.fitBounds(_this.marker.getBounds());

        // enable interaction
        _this.map.dragging.enable();
        _this.map.touchZoom.enable();
        _this.map.doubleClickZoom.enable();
        _this.map.scrollWheelZoom.enable();
        _this.map.boxZoom.enable();
        _this.map.keyboard.enable();
        if (_this.map.tap) _this.map.tap.enable();
        document.getElementById('map2').style.cursor='grab';
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
    .component('geosearch',{
        templateUrl: '../../partials/geo/search.html',
        bindings: {
            selectedPeriodId: '<'
        },
        controller: GeoSearchController
    });
