/**
 * GoogleBundle Javascript object.
 */
var GoogleBundle = (function() {
    var wrappers = []; //Contains map wrappers 

    function MapWrapper(id) {
        this.id = id;                   //Map id
        this.markers = [];              //Markers
        this.map = null;                //Map
        this.currentInfowindow = false; //Currently opened infowindow
        this.clickMarker = false;       //Marker created on "click" event.
    }

    /**
     * Initialize GoogleMap
     */
    MapWrapper.prototype.initialize = function (options) {
        google.maps.Marker.prototype.data = '';
        this.map = new google.maps.Map(document.getElementById(this.id), options);
    }

    /**
     * Add marker to map by coordinates. Text is optional for marker's infowindow
     */
    MapWrapper.prototype.addMarker = function (latitude, longitude, text) {
        var marker = new google.maps.Marker({
                position: new google.maps.LatLng(latitude, longitude),
                map: this.map,
                text: text
        })
        var infowindow = new google.maps.InfoWindow({ content: text });

        var mapwrapper = this;
        google.maps.event.addListener(marker, "click", function () {
            if (mapwrapper.currentInfowindow) {
                mapwrapper.currentInfowindow.close();
            }
            infowindow.open(this.map, marker);
            mapwrapper.currentInfowindow = infowindow;
        });
        marker.setVisible(true);
        this.markers.push(marker);

        return marker;
    }

    MapWrapper.prototype.clear = function () {
        jQuery.each(this.markers, function(index, marker) {
            marker.setVisible(false);
            marker = null;
        });
        this.markers = [];
    }

    /**
     * Fit map to markers (also calculates zoom)
     */
    MapWrapper.prototype.fitToMarkers = function () {
        var bounds = new google.maps.LatLngBounds();
        for (index in this.markers) {
            bounds.extend(this.markers[index].position);
        }
        this.map.fitBounds(bounds);
    }

    /**
     * Set and handle click callback 
     */
    MapWrapper.prototype.click = function (callback) {
        var mapwrapper = this;
        google.maps.event.addListener(mapwrapper.map, "click", function(event) {  
            if (mapwrapper.clickMarker) {
                mapwrapper.clickMarker.setMap(null);
                mapwrapper.clickMarker = null;
            }
            
            mapwrapper.clickMarker = new google.maps.Marker({
                position: event.latLng,
                map: mapwrapper.map,
                zIndex: Math.round(event.latLng.lat()*-100000)<<5
            });

            callback(event.latLng);
        });
    }

    /**
     * GoogleBundle MapWrapper access
     */
    function Map(id) {
        if ('undefined' === typeof wrappers[id]) {
            wrappers[id] = new MapWrapper(id);
        }
        return wrappers[id];
    }

    return {
        Map: Map
    }
}());

var GoogleBundleSearch = function() {
    var search = document.forms['GoogleBundleSearchForm']['GoogleBundleSearch_search'].value;
    $.ajax({
        async: false,
        url: '/google/cities/' + search,
        success: function(data) {
            if ('undefined' !== typeof GoogleBundle) {
                GoogleBundle.Map("pso-garage-map").clear();
                jQuery.each(data, function(index, marker) {
                    GoogleBundle.Map("pso-garage-map").addMarker(marker.lat, marker.lng, marker.text);
                });
                GoogleBundle.Map("pso-garage-map").fitToMarkers(true);
            }
        },
        error: function(errorData) {
            if (console) {
                console.log(errorData);
            }
        }

    });
};
