angular.module('chronontology.components')
    .component('geomap',{
        templateUrl: '../../partials/geo/map.html',
        bindings: {
            g1:'@', //spatiallyPartOfRegion
            g2:'@', //isNamedAfter
            g3:'@'  //hasCoreArea
        },
        controller: function($scope, $location, $routeParams, $http, $sce, chronontologySettings){
            var _this = this;
            var popupinfo = [];
            // set div to loading
            document.getElementById("map").innerHTML = "<h1 class='maploading'>map is loading...</h1>";
            // load data
            var geowidgetParam = "?uri=" + chronontologySettings.baseUri + "/period/";
            $http.get(chronontologySettings.geowidgetURL + geowidgetParam + $routeParams.id).success(function(geojson){
                _this.geojson = geojson;
                initMap(geojson);
    		});
            function initMap(geojson) {
                // clear map div
                document.getElementById("map").innerHTML = "";
                // set styles
                var colors = {};
                colors.spatiallyPartOfRegion = "#ff0000";
                colors.isNamedAfter = "#00ff00";
                colors.hasCoreArea = "#9214ff";
                var styleattr = {};
                styleattr.color = "#ffffff";
                styleattr.weight = 1.5;
                styleattr.opacity = 1;
                styleattr.fillOpacity = 0.7;
                var spatiallyPartOfRegion = {color: styleattr.color, fillColor: colors.spatiallyPartOfRegion, weight: styleattr.weight, opacity: styleattr.opacity, fillOpacity: styleattr.fillOpacity};
                var spatiallyPartOfRegionCircle = {fillColor: colors.spatiallyPartOfRegion, color: styleattr.color, weight: styleattr.weight, opacity: styleattr.opacity, fillOpacity: styleattr.fillOpacity};
            	var isNamedAfter = {color: colors.isNamedAfter, fillColor: colors.isNamedAfter, weight: styleattr.weight, opacity: styleattr.opacity, fillOpacity: styleattr.fillOpacity};
                var isNamedAfterCircle = {color: colors.isNamedAfter, fillcolor: styleattr.color, weight: styleattr.weight, opacity: styleattr.opacity, fillOpacity: styleattr.fillOpacity};
            	var hasCoreArea = {color: colors.hasCoreArea, fillColor: colors.hasCoreArea, weight: styleattr.weight, opacity: styleattr.opacity, fillOpacity: styleattr.fillOpacity};
                var hasCoreAreaCircle = {color: colors.hasCoreArea, fillcolor: styleattr.color, weight: styleattr.weight, opacity: styleattr.opacity, fillOpacity: styleattr.fillOpacity};
                // init map
                _this.mapY = 0;
                _this.mapX = 0;
                _this.markersArea = 0;
                _this.mapZoom = 2;
                _this.baseLayer = L.tileLayer('http://{s}.tiles.mapbox.com/v3/isawnyu.map-knmctlkh/{z}/{x}/{y}.png', {
                    maxZoom: 15,
                    attribution: "<a href='javascript:alert(\"Tiles (c) MapBox (http://mapbox.com), Data (c) OpenStreetMap (http://www.openstreetmap.org) and contributors, CC-BY-SA, Tiles and Data (c) 2013 AWMC (http://www.awmc.unc.edu) CC-BY-NC 3.0 (http://creativecommons.org/licenses/by-nc/3.0/deed.en_US)\");'>Attribution</a>"
                });
                _this.map = L.map("map", {
                    fullscreenControl: {pseudoFullscreen: false},
                    center: [_this.mapY, _this.mapX],
                    zoom: _this.mapZoom,
                    layers: [_this.baseLayer]
                });
                // add scale
                L.control.scale().addTo(_this.map);
                // add legend
                var legend = L.control({position: 'topright'});
                legend.onAdd = function (map) {
                    var div = L.DomUtil.create('div', 'info legend');
                    div.innerHTML += '<i style="background:' + colors.spatiallyPartOfRegion + '"></i> ' + _this.g1 + '<br>';
                    div.innerHTML += '<i style="background:' + colors.isNamedAfter + '"></i> ' + _this.g2 + '<br>';
                    div.innerHTML += '<i style="background:' + colors.hasCoreArea + '"></i> ' + _this.g3 + '<br>';
                    return div;
                };
                legend.addTo(_this.map);
                // add markers and polygons
                _this.markers = L.markerClusterGroup();
                var marker = L.geoJson(geojson, {
        			onEachFeature: onEachFeature,
        			style: function (feature) {
        				if (feature.geometry.type != "Point") {
        					if (feature.properties.relation === "spatiallyPartOfRegion") {
        						return spatiallyPartOfRegion;
        					} else if (feature.properties.relation === "isNamedAfter") {
        						return isNamedAfter;
        					} else if (feature.properties.relation === "hasCoreArea") {
        						return hasCoreArea;
        					} else {
        						return spatiallyPartOfRegion;
        					}
        				}
        			},
        			pointToLayer: function (feature, latlng) {
        				if (feature.properties.relation === "spatiallyPartOfRegion") {
        					return L.circleMarker(latlng, spatiallyPartOfRegionCircle).setRadius(8);
        				} else if (feature.properties.relation === "isNamedAfter") {
        					return L.circleMarker(latlng, isNamedAfterCircle).setRadius(8);
        				} else if (feature.properties.relation === "hasCoreArea") {
        					return L.circleMarker(latlng, hasCoreAreaCircle).setRadius(8);
        				} else {
        					return L.circleMarker(latlng, spatiallyPartOfRegionCircle).setRadius(8);
        				}
        			}
        		});
                // add marker as layer
                _this.markers.addLayer(marker);
                _this.map.addLayer(_this.markers);
                // calc area and zoom
                var area = turf.area(geojson); // http://turfjs.org/docs/#area --> area in square meters
                if (_this.markersArea <= 1000000) { // 1 Mio.
                    _this.mapZoom = 5;
                } else if (_this.markersArea <= 10000000) { // 10 Mio.
                    _this.mapZoom = 3;
                } else if (_this.markersArea <= 20000000) { // 20 Mio.
                    _this.mapZoom = 3;
                } else if (_this.markersArea <= 30000000) { // 30 Mio.
                    _this.mapZoom = 3;
                } else {
                    _this.mapZoom = 1; // world
                }
                // add popup
                var popupContent = "";
        		for (var i=0; i< popupinfo.length; i++) {
        			var split = popupinfo[i].split(";");
        			popupContent += "<a href='" + split[1] + "' target='_blank'>"+split[0]+"</a><br>";
        		}
        		marker.bindPopup(popupContent);
                console.info(_this);
            }
            function onEachFeature(feature, layer) {
                popupinfo.push(feature.properties.name + ";" + feature.properties.homepage);
            }
        }
    });
