(function ($, win) {

    "use strict";

    win.Polygon = function(map, options) {
        this.googleMap = map;
        this.options = $.extend(true, {}, this.defaults, options);
        this.initialize();
    };

    Polygon.prototype = {
        defaults: {
            strokeColor: "#387ced",
            fillColor: '#387ced',
            strokeWeight: 2,
            clickable: false,
            isVisible: false,
            editMode: false,
            points: null
        },

        mapClickEventHandler: null,
        
        polygon: null,
        
        initialize: function() {
            this.polygon = new google.maps.Polygon({
                strokeWeight: this.options.strokeWeight,
                strokeColor: this.options.strokeColor,
                fillColor: this.options.fillColor,
                clickable: this.options.clickable,
                editable: this.options.editMode,
                zIndex: 2000
            });

            if (this.options.points) {
                this.polygon.setPaths(points);
            }

            this.polygon.setMap(this.googleMap);

            if (this.options.isVisible && this.options.editMode) {
                this.getFocus();
            } else if (this.options.isVisible) {
                this.showPolygon();
            } else {
                this.hidePolygon();
            }

            return this;
        },

        setPaths: function(paths) {
            this.polygon.setPaths(paths);

            this.showPolygon();

            return this;
        },

        getFocus: function() {
            var self = this;

            this.polygon.setEditable(true);

            this.polygon.setVisible(true);
            
            this.options.isVisible = true;
            
            this.options.editMode = true;

            if (!this.mapClickEventHandler) {
                this.mapClickEventHandler = google.maps.event.addListener(this.googleMap, 'click', function(event) {
                    var p = self.polygon.getPath();
                    p.push(event.latLng);
                });
            }

            this.polygon.addListener('dblclick', function(e) {
                var p;

                if (e.vertex == undefined) {
                    return;
                }

                p = self.polygon.getPath();

                if (p.getLength() > 2) {
                    self.polygon.getPath().removeAt(e.vertex);
                }
            });

            return this;
        },

        removeFocus: function() {
            this.options.editMode = false;
            
            this.polygon.setEditable(false);
            
            if (this.mapClickEventHandler !== null) {
                google.maps.event.removeListener(this.mapClickEventHandler);
            
                this.mapClickEventHandler = null;
            }

            return this;
        },

        hidePolygon: function() {
            if (this.polygon.getPath()) {

                this.removeFocus();
            
                this.polygon.setVisible(false);
            
                this.options.isVisible = false;
            }
            return this;
        },

        showPolygon: function () {
            this.polygon.setVisible(true);
            
            this.options.isVisible = true;
            
            return this;
        },

        getPolygonPointsArray: function() {
            var points = [];
            var decimals = 10000;
            var paths = this.polygon.getPath();

            paths.forEach(function(element) {
                var lat = Math.round(element.lat() * decimals) / decimals;
                var lng = Math.round(element.lng() * decimals) / decimals;
                points.push(lng + " " + lat);
            });

            return points;
        },

        getEncodedPath: function() {
            var paths = this.polygon.getPath()
            if (paths) {
                return google.maps.geometry.encoding.encodePath(paths);
            }
        },

        getWkt: function() {
            var points = this.getPolygonPointsArray();

            if (points.length > 2) {
                
                if (points[0] !== points[points.length - 1]) {
                    points.push(points[0]);
                }
                
                return 'POLYGON((' + points.join(',') + '))';
            }

            return false;
        },

        remove: function() {
            if (this.mapClickEventHandler) {
                google.maps.event.removeListener(this.mapClickEventHandler);
                this.mapClickEventHandler = null;
            }

            if (this.polygon) {
                try {
                    this.polygon.removeListener('dblclick');
                } catch (eventRemoveError) {

                }
            }

            this.polygon.setMap(null);

            return this;
        }
    };

}(jQuery, window));