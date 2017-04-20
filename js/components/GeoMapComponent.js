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
                colors.isNamedAfter = "#FFA500";
                colors.hasCoreArea = "#9214ff";
                var styleattr = {};
                styleattr.color = "#ffffff";
                styleattr.weight = 1.75;
                styleattr.opacity = 1;
                styleattr.fillOpacity = 0.65;
                var spatiallyPartOfRegion = {color: styleattr.color, fillColor: colors.spatiallyPartOfRegion, weight: styleattr.weight, opacity: styleattr.opacity, fillOpacity: styleattr.fillOpacity};
            	var isNamedAfter = {color: styleattr.color, fillColor: colors.isNamedAfter, weight: styleattr.weight, opacity: styleattr.opacity, fillOpacity: styleattr.fillOpacity};
            	var hasCoreArea = {color: styleattr.color, fillColor: colors.hasCoreArea, weight: styleattr.weight, opacity: styleattr.opacity, fillOpacity: styleattr.fillOpacity};
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
                    var stopA = false;
                    var stopB = false;
                    var stopC = false;
                    for (var feature in geojson.features) {
                        if (geojson.features[feature].properties.relation) {
                            if (geojson.features[feature].properties.relation.indexOf("spatiallyPartOfRegion") !== -1 && !stopA) {
                                div.innerHTML += '<i style="background:' + colors.spatiallyPartOfRegion + '"></i> ' + _this.g1 + '<br>';
                                stopA = true;
                            } else if (geojson.features[feature].properties.relation.indexOf("isNamedAfter") !== -1 && !stopB) {
                                div.innerHTML += '<i style="background:' + colors.isNamedAfter + '"></i> ' + _this.g2 + '<br>';
                                stopB = true;
                            } else if (geojson.features[feature].properties.relation.indexOf("hasCoreArea") !== -1 && !stopC) {
                                div.innerHTML += '<i style="background:' + colors.hasCoreArea + '"></i> ' + _this.g3 + '<br>';
                                stopC = true;
                            }
                        }
                    }
                    return div;
                };
                legend.addTo(_this.map);
                // add markers and polygons
                _this.markers = L.markerClusterGroup();
                var marker = L.geoJson(geojson, {
        			onEachFeature: onEachFeature,
        			style: function (feature, latlng) {
    					if (feature.properties.relation === "spatiallyPartOfRegion") {
    						return spatiallyPartOfRegion;
    					} else if (feature.properties.relation === "isNamedAfter") {
    						return isNamedAfter;
    					} else if (feature.properties.relation === "hasCoreArea") {
    						return hasCoreArea;
    					} else {
    						return spatiallyPartOfRegion;
    					}
        			},
        			pointToLayer: function (feature, latlng) {
                        // create polygon out of point
                        var point = turf.point([latlng.lat, latlng.lng]);
                        var buffer = turf.buffer(point, 25, "kilometers");
                        return L.polygon(buffer.geometry.coordinates);
        			}
        		});
                // add marker as layer
                _this.markers.addLayer(marker);
                _this.map.addLayer(_this.markers);
                // calc area and zoom
                var area = turf.area(geojson); // http://turfjs.org/docs/#area --> area in square meters
                _this.markersArea = parseFloat((area/1000000).toFixed(2));
                if (_this.markersArea === 0) { // point
                    _this.mapZoom = 8;
                } else if (_this.markersArea <= 1000000) { // 1 Mio.
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
                // calc layer center
                _this.mapY = _this.markers.getBounds().getCenter().lat;
                _this.mapX = _this.markers.getBounds().getCenter().lng;
                // set map
                console.info("geojson-area[km²]",_this.markersArea,"map-zoom",_this.mapZoom,"geojson-center",_this.mapY,_this.mapX);
                _this.map.setView([_this.mapY, _this.mapX], _this.mapZoom);
                // add popup
                var popupContent = "";
        		for (var i=0; i< popupinfo.length; i++) {
        			var split = popupinfo[i].split(";");
        			popupContent += "<a href='" + split[1] + "' target='_blank'>"+split[0]+"</a> <i>["+split[2]+"]</i><br>";
        		}
        		marker.bindPopup(popupContent);
                console.info(_this);
            }
            function onEachFeature(feature, layer) {
                popupinfo.push(feature.properties.name + ";" + feature.properties.homepage + ";" + feature.properties.relation);
            }
        }
    });
