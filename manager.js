(function ($, Polygon, win) {

    win.PolygonTool = function(configs) {
        this.configs = $.extend(true, {}, this.configs, configs);
        this.$polygonHelp = $('#polygon-help');
    };

    PolygonTool.prototype = {
        configs: {
            useEncodedPolygons: true
        },
        $polygonHelp: [],
        $editBtn: [],
        $createBtn: [],
        $deleteBtn: [],
        $editDeleteContainer: [],
        polygon: null,
        usingPolygon: false,
        $field: [],


        render: function() {
            return this.addButtonsToMap();
        },

        addButtonsToMap: function() {
            var self = this;

            var $wrap = $('<div id="polygon-tool"></div>');

            $(document)
                .on('click', 'button[data-action="create-polygon"]', function(e) {
                    e.preventDefault();
                    self.createPolygon();
                })
                .on('click', 'button[data-action="edit-polygon"]', function(e) {
                    e.preventDefault();
                    self.editPolygon();
                })
                .on('click', 'button[data-action="delete-polygon"]', function(e) {
                    e.preventDefault();
                    self.deletePolgyon();
                })
                .on('click', 'button[data-action="complete-polygon"]', function(e) {
                    e.preventDefault();
                    self.completePolygon();
                })
            ;

            this.$createBtn = $('<button class="polygon-tool-btn enabled" type="button" data-action="create-polygon" title="Draw" class="enabled">Draw</button>').appendTo($wrap);            
            
            this.$editDeleteContainer = $('<div class="polygon-tool-edit-delete"></div>').appendTo($wrap);
            
            this.$editBtn = $('<button class="polygon-tool-btn enabled" type="button" data-action="edit-polygon" title="Edit" class="">Edit</button>').appendTo(this.$editDeleteContainer);

            this.$deleteBtn = $('<button class="polygon-tool-btn enabled" type="button" data-action="delete-polygon" title="Remove" class="">Remove</button>').appendTo(this.$editDeleteContainer);

            return $wrap;
        },

        hideHelp: function() {
            this.$polygonHelp.removeClass('active');
        },

        showHelp: function() {
            this.$polygonHelp.addClass('active');
        },

        toggleButtons: function(state) {
            if (state) {
                this.$editDeleteContainer.addClass('active');
            } else {
                this.$editDeleteContainer.removeClass('active');
            }
        },

        /**
         * Remove the polygon from the map
         */
        deletePolgyon: function() {
            // remove from map
            if (this.polygon) {
                this.polygon.remove();              
            }

            this.polygon = null;

            this.hideHelp();

            this.usingPolygon = false;

            this.toggleButtons(false);
        },

        /**
         * Complete the polygon
         */
        completePolygon: function() {
            var encodedPath;

            if (this.polygon) {

                // get the new polygon using either the encoded path or the raw wkt. you can set this in the configs
                if (this.configs.useEncodedPolygons) {
                    encodedPath = this.polygon.getEncodedPath();
                } else {
                    encodedPath = this.polygon.getWkt();
                }

                if (encodedPath) { 
                    this.usingPolygon = true;
                    
                    this.polygon.removeFocus();
                    
                    this.hideHelp();
                    
                    this.toggleButtons(true);

                    console.log(encodedPath);
                } else {
                    alert('not enough points');
                }
            }
        },

        /**
         * Draw our polygon
         */
        createPolygon: function() {
            if (!this.polygon) {
                this.polygon = new Polygon(map);
            }

            if (!this.usingPolygon) {
                this.showHelp();

                this.toggleButtons(false);

                this.polygon.initialize().getFocus();
            } else {
                if (this.$editDeleteContainer.hasClass('active')) {
                    this.toggleButtons(false);
                } else {
                    this.toggleButtons(true);
                }
            }
        },

        /**
         * edit polygon
         */
        editPolygon: function() {
            if (this.usingPolygon) {
                this.showHelp();

                this.toggleButtons(false);
                
                this.polygon.getFocus();
            } else {
                this.createPolygon()
            }
        },

        hasPolygon: function() {
            return this.usingPolygon;
        },

        /**
         * add a polygon based on a wkt string
         * @param {string} wkt
         */
        addPolygonFromWkt: function(wkt) {
            var points = this.parsePolyStrings(wkt);

            if (points.length > 2) {

                if (!this.polygon) {
                    this.polygon = new Polygon(map);
                }

                this.usingPolygon = true;

                this.polygon.setPaths(points);

                this.toggleButtons(true);

                this.hideHelp();

                this.polygon.removeFocus();

                console.log(wkt);
            }
        },

        parsePolyStrings: function(ps) {
            var i;
            var j;
            var tmp;
            var arr = [];
            var m;

            // if the word poly is not in the ps, we have an encoded polygon so send it back decoded
            if (ps.indexOf('poly') === -1 && ps.indexOf('POLY') === -1) {
                return google.maps.geometry.encoding.decodePath(ps);
            }

            // break up the wkt
            m = ps.match(/\([^\(\)]+\)/g);

            if (m !== null) {
                for (i = 0; i < m.length; i++) {
                    // match all numeric strings
                    tmp = m[i].match(/-?\d+\.?\d*/g);
                    if (tmp !== null) {
                        // convert all the coordinate sets in tmp from strings to Numbers and convert to LatLng objects
                        for (j = 0; j < tmp.length; j+=2) {
                            arr.push({lat:Number(tmp[j + 1]), lng:Number(tmp[j])});
                        }
                    }
                }
            }

            if (arr.length > 2) {
                if (arr[0].lat == arr[arr.length-1].lat && arr[0].lng == arr[arr.length-1].lng) {
                    arr.pop();
                }
            }

            return arr;
        }
    };
}(jQuery, Polygon, window));