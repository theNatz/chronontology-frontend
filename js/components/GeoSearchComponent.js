function GeoSearchController($scope, $location, $routeParams, $http, $sce, chronontologySettings, $filter) {

    var _this = this;
    var popupinfo = [];

    _this.loading = false;
    _this.empty = false;

    this.$onChanges = function(changes) {
        if (changes.selectedPeriodId && _this.selectedPeriodId) {
            this.initMap();
        }
    };

    this.loadData = function(upperright, upperleft, lowerleft, lowerright, e) {
        var bbox = upperleft + ";" + lowerleft + ";" + upperright + ";" + lowerright;
        console.log("http://ls-dev.i3mainz.hs-mainz.de/spi/place?bbox="+bbox+"&type=getty");
        _this.loading = true;
        _this.empty = true;
        $http.get("/spi/place?bbox="+bbox+"&type=getty", {
                headers: { 'Authorization': undefined }
        }).then(function success(geojson){
            _this.loading = false;
            _this.geojson = geojson.data;
            if (geojson.data.features.length > 0) {
                _this.empty = false;
                _this.initPlaces(geojson.data);
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
        _this.map = L.map("map2", {
            fullscreenControl: {pseudoFullscreen: false},
            center: [_this.mapY, _this.mapX],
            zoom: _this.mapZoom,
            layers: [_this.baseLayer]
        });
        // add scale
        L.control.scale().addTo(_this.map);
        // add draw control
		_this.drawnItems = new L.FeatureGroup();
		L.drawLocal.draw.toolbar.buttons.rectangle = 'Draw a boundingbox for selection';
		_this.drawControl = new L.Control.Draw({
			position: 'topleft',
			draw: {
				polyline: false,
				polygon: false,
				circle: false,
                circlemarker: false,
				marker: false,
				rectangle: {
					metric: true,
					shapeOptions: {
						color: '#0000FF'
					}
				}
			},
			edit: {
				featureGroup: _this.drawnItems,
				remove: false,
				edit: false
			}
		});
		_this.map.addControl(_this.drawControl);
        // add bbox action
        _this.map.on('draw:created', function (e) {
            if (_this.markers) {
                _this.map.removeLayer(_this.markers);
            }
            if (e.layer._latlngs) {
                var maxAreaSize = 25000;
                var upperright = e.layer._latlngs[0].lat + ";" + e.layer._latlngs[0].lng;
    			var upperleft = e.layer._latlngs[1].lat + ";" + e.layer._latlngs[1].lng;
    			var lowerleft = e.layer._latlngs[2].lat + ";" + e.layer._latlngs[2].lng;
    			var lowerright = e.layer._latlngs[3].lat + ";" + e.layer._latlngs[3].lng;
    			var x = ((e.layer._latlngs[0].lng) + (e.layer._latlngs[3].lng)) / 2;
    			var y = ((e.layer._latlngs[0].lat) + (e.layer._latlngs[2].lat)) / 2;
    			var area = (LGeo.area(e.layer) / 1000000).toFixed(2);
    			var currentZoom = _this.map.getZoom();
    			if (area < maxAreaSize) {
                    _this.loadData(upperright, upperleft, lowerleft, lowerright, e);
    				setTimeout(function () {
    					_this.map.setView([y, x], 8);
    				}, 1);
    			} else {
                    alert("selected area is too big: " + area + " km2");
    				setTimeout(function () {
    					_this.map.setView([y, x], currentZoom);
    				}, 1);
    			}
    		} else {
    			console.log("latlng=" + e.layer._latlng.lat + ";" + e.layer._latlng.lng);
    		}
    	});
    };

    this.initPlaces = function(geojson) {

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
