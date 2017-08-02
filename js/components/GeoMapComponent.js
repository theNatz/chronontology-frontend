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
            var geowidgetParam = "?id=";
            $http.get("/spi/GetGeoJSONT" + geowidgetParam + $routeParams.id, {
                    headers: { 'Authorization': undefined }
            }).success(function(geojson){
                _this.geojson = geojson;
                initMap(geojson);
    		});
            function initMap(geojson) {
                // clear map div
                document.getElementById("map").innerHTML = "";
                // set styles and stle params
                var colors = {};
                colors.spatiallyPartOfRegion = "#ff0000";
                colors.isNamedAfter = "#32CD32";
                colors.hasCoreArea = "#9214ff";
                var styleattr = {};
                styleattr.weight = 1.75;
                styleattr.opacity = 1;
                styleattr.fillOpacity = 0;
                var spatiallyPartOfRegion = {
                    color: colors.spatiallyPartOfRegion,
                    weight: styleattr.weight,
                    opacity: styleattr.opacity,
                    fillOpacity: styleattr.fillOpacity
                };
            	var isNamedAfter = {
                    color: colors.isNamedAfter,
                    weight: styleattr.weight,
                    opacity: styleattr.opacity,
                    fillOpacity: styleattr.fillOpacity
                };
            	var hasCoreArea = {
                    color: colors.hasCoreArea,
                    weight: styleattr.weight,
                    opacity: styleattr.opacity,
                    fillOpacity: styleattr.fillOpacity
                };
                // init map
                _this.mapY = 0;
                _this.mapX = 0;
                _this.markersArea = 0;
                _this.mapZoom = 1;
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
                var legend = L.control({position: 'bottomright'});
                legend.onAdd = function (map) {
                    var div = L.DomUtil.create('div', 'info legend');
                    var stopA = false;
                    var stopB = false;
                    var stopC = false;
                    for (var feature in geojson.features) {
                        if (geojson.features[feature].properties.relation) {
                            if (geojson.features[feature].properties.relation.indexOf("spatiallyPartOfRegion") !== -1 && !stopA) {
                                div.innerHTML += '<box style="border-color:' + colors.spatiallyPartOfRegion + '"></box><content>' + _this.g1 + '</content>';
                                stopA = true;
                            } else if (geojson.features[feature].properties.relation.indexOf("isNamedAfter") !== -1 && !stopB) {
                                div.innerHTML += '<box style="border-color:' + colors.isNamedAfter + '"></box><content>' + _this.g2 + '</content>';
                                stopB = true;
                            } else if (geojson.features[feature].properties.relation.indexOf("hasCoreArea") !== -1 && !stopC) {
                                div.innerHTML += '<box style="border-color:' + colors.hasCoreArea + '"></box><content>' + _this.g3 + '</content>';
                                stopC = true;
                            }
                        }
                    }
                    return div;
                };
                legend.addTo(_this.map);
                // add info legend
                _this.infoLegend = L.control({position: 'topright'});
                _this.infoLegend.onAdd = function (map) {
                    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
                    this.update();
                    return this._div;
                };
                _this.infoLegend.update = function (props) {
                    this._div.innerHTML = "<h4>Geometry Information</h4>";
                    this._div.innerHTML +=  (props ?
                        "<span><b>" + props.name + "</b></span>" +
                        "<br><span><i>" + props.relation + "</i></span>" +
                        "<br><span>Gazetteer ID: " + props.id + "</span>" +
                        "<br><hr class=\"linehr\"><span>parent geometry: " + props.parentGeometry.name + "</span>" +
                        "<br><span>parent ID: " + props.parentGeometry.id + "</span>"
                        : "<span>no geometry selected</span>");
                    if (this._div.innerHTML.indexOf("geom origin") != -1) {
                        this._div.innerHTML = this._div.innerHTML.replace("<hr class=\"linehr\">","");
                        this._div.innerHTML = this._div.innerHTML.replace("<span>parent geometry: geom origin</span>","");
                        this._div.innerHTML = this._div.innerHTML.replace("<br><span>parent ID: null</span>","");
                    }
                    this._div.innerHTML = this._div.innerHTML.replace("spatiallyPartOfRegion",_this.g1);
                    this._div.innerHTML = this._div.innerHTML.replace("isNamedAfter",_this.g2);
                    this._div.innerHTML = this._div.innerHTML.replace("hasCoreArea",_this.g3);
                };
                _this.infoLegend.addTo(_this.map);
                // add markers and polygons
                _this.marker = L.geoJson(geojson, {
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
                        var envelope = turf.envelope(buffer);
                        return L.polygon(envelope.geometry.coordinates);
        			}
        		});
                // add marker as layer
                _this.map.addLayer(_this.marker);
                // calc layer center
                _this.mapY = _this.marker.getBounds().getCenter().lat;
                _this.mapX = _this.marker.getBounds().getCenter().lng;
                // set map
                _this.map.setView([_this.mapY, _this.mapX], _this.mapZoom);
                // zoom to bounds
                _this.map.fitBounds(_this.marker.getBounds());
                console.info(_this);
            }
            function onEachFeature(feature, layer) {
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight,
                    click: highlightFeature,
                    dblclick: zoomToFeature
                });
            }
            function highlightFeature(e) {
                // highlight feature
                e.target.setStyle({
                    weight: 1.75,
                    color: "#000000",
                    fillOpacity: 0.5,
                    fillColor: "#FFD700"
                });
                // set info to legend
                _this.infoLegend.update(e.target.feature.properties);
            }
            function resetHighlight(e) {
                // reset highlight
                _this.marker.resetStyle(e.target);
                // reset legend
                _this.infoLegend.update();
            }
            function zoomToFeature(e) {
                _this.map.fitBounds(e.target.getBounds());
            }
        }
    });
