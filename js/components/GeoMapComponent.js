angular.module('chronontology.components')
    .component('geomap',{
        templateUrl: '../../partials/geo/map.html',
        controller: function($scope, $location, $routeParams, $http, $sce, chronontologySettings){
            var _this = this;
            var popupinfo = [];
            // set div to loading
            document.getElementById("map").innerHTML = "<h1 style='text-align:center;line-height:250px;'>map is loading...</h1>";
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
                colors.spatiallypartofregion = "#ff0000";
                colors.namedafter = "#00ff00";
                colors.hasecoreregion = "#ff34b3";
                colors.undefinedregion = "#9214ff";
                var styleattr = {};
                styleattr.color = "#ffffff";
                styleattr.weight = 3;
                styleattr.opacity = 1;
                styleattr.fillopacity = 0.7;
                var spatiallyPartOfRegion = {color: styleattr.color, fillColor: colors.spatiallypartofregion, weight: styleattr.weight, opacity: styleattr.opacity, fillOpacity: styleattr.fillopacity};
                var spatiallyPartOfRegionCircle = {fillColor: colors.spatiallypartofregion, color: styleattr.color, weight: styleattr.weight, opacity: styleattr.opacity, fillOpacity: styleattr.fillopacity};
            	var namedAfter = {color: colors.namedafter, fillColor: colors.namedafter, weight: styleattr.weight, opacity: styleattr.opacity, fillOpacity: styleattr.fillopacity};
                var namedAfterCircle = {color: colors.namedafter, fillcolor: styleattr.color, weight: styleattr.weight, opacity: styleattr.opacity, fillOpacity: styleattr.fillopacity};
            	var hasCoreRegion = {color: colors.hasecoreregion, fillColor: colors.hasecoreregion, weight: styleattr.weight, opacity: styleattr.opacity, fillOpacity: styleattr.fillopacity};
                var hasCoreRegionCircle = {color: colors.hasecoreregion, fillcolor: styleattr.color, weight: styleattr.weight, opacity: styleattr.opacity, fillOpacity: styleattr.fillopacity};
            	var undefinedRegion = {color: colors.undefinedregion, fillColor: colors.undefinedregion, weight: 0, opacity: styleattr.opacity, fillOpacity: styleattr.fillopacity};
                var undefinedRegionCircle = {color: colors.undefinedregion, fillcolor: styleattr.color, weight: styleattr.weight, opacity: styleattr.opacity, fillOpacity: styleattr.fillopacity};
                // init map
                _this.mapY = 50.009167;
                _this.mapX = 4.666389;
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
                    div.innerHTML += '<i style="background:' + colors.spatiallypartofregion + '"></i> ' + "spatially part of region" + '<br>';
                    div.innerHTML += '<i style="background:' + colors.namedafter + '"></i> ' + "named after" + '<br>';
                    div.innerHTML += '<i style="background:' + colors.hasecoreregion + '"></i> ' + "has core region" + '<br>';
                    div.innerHTML += '<i style="background:' + colors.undefinedregion + '"></i> ' + "undefined" + '<br>';
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
        					} else if (feature.properties.relation === "namedAfter") {
        						return namedAfter;
        					} else if (feature.properties.relation === "hasCoreRegion") {
        						return hasCoreRegion;
        					} else if (feature.properties.relation === "undefined") {
        						return undefinedRegion;
        					} else {
        						return undefinedRegion;
        					}
        				}
        			},
        			pointToLayer: function (feature, latlng) {
        				if (feature.properties.relation === "spatiallyPartOfRegion") {
        					return L.circleMarker(latlng, spatiallyPartOfRegionCircle).setRadius(8);
        				} else if (feature.properties.relation === "namedAfter") {
        					return L.circleMarker(latlng, namedAfterCircle).setRadius(8);
        				} else if (feature.properties.relation === "hasCoreRegion") {
        					return L.circleMarker(latlng, hasCoreRegionCircle).setRadius(8);
        				} else {
        					return L.circleMarker(latlng, undefinedRegionCircle).setRadius(8);
        				}
        			}
        		});
                _this.markers.addLayer(marker);
		        _this.map.addLayer(_this.markers);
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
