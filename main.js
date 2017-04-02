var map;
var geocoder;
var markers = [];

$(document).ready(function() {
    initializeGeocoder(); // Initializes Geocoder
})

if (navigator.geolocation) { //add geolocation
    $("#form").submit(function (e) { //target the form

        deleteMarkers(); // Clears array and map of markers
        codeAddress(); // Grab location of user
        
        var actionurl = e.currentTarget.action;

        $("#results").empty(); // Reset the results div to hold the new results
        $.ajax({ // Use AJAX for the post request
            url: actionurl,
            type: 'post',
            data: $("#form").serialize(),
            success: function (resp) {
                $("#results").append('<div id="accordion"></div>');
                // The above line adds a div container to hold the results in accordion form
                if (resp.length === 0) { // Alerts user if no results are found
                    $('#results').append("<p>Number of results: 0 </p>");
                } else {
                    for (var i = 0; i < resp.length; i++) { // Iterate through 
                        var data = resp[i]; // Assign response to data variable for readability
                        var latLng = new google.maps.LatLng(data.coordinates.latitude, data.coordinates.longitude); // Latitude and longitude coords
                        addMarker(latLng, resp[i])
                        $("#accordion").append(accordionName(resp[i]) + 
                                               "<div><p>Location: " + 
                                               accordionLocation(resp[i]) + 
                                               "<br>" + 
                                               "Phone number: " + accordionPhone(resp[i]) + 
                                               "<br>" + 
                                               "Price: " + accordionPrice(resp[i]) + 
                                               "<br>" + 
                                               "Rating: " + accordionRating(resp[i]) + 
                                               "</p></div>")
                    }
                }
                //Add each result into the accordion div container so the user can see each result
                $("#accordion").accordion({collapsible: true, active: false});
                $("#results").append("<p>Number of results: " + resp.length +  "</p>");
            },
            error: function (err) {
                console.error(err)
                alert ("Error: Unspecified value")
            }
        })

        // Prevent default functionality
        e.preventDefault();
    })
    
// Else statement for non-geolocation browsers
} else {
    alert("Geolocation is not supported on this browser") // Inform user geolocation is not enabled/supported
}

/* Start of accordion functions */

// Function to return the header for the accordion
function accordionName(response_body) {
    var name = response_body.name;
    return "<h3 id='result'>" + name + "</h3>";
}

// Given a response, combs through it and produces a 
function accordionLocation(response_body) {
    var address = response_body.location.address1;
    var stateZip = response_body.location.display_address[1];
    var country = response_body.location.country;
    var rating = response_body.rating;
    return address + ", " + stateZip + ", " + country;
}

// Function to produce phone number of store
function accordionPhone(response_body) {
    var phone = response_body.display_phone;
    return phone;
}

// Function to produce price range of store
function accordionPrice(response_body) {
    var price = response_body.price;
    return price;
}

// Function to produce rating of store
function accordionRating(response_body) {
    var rating = response_body.rating;
    return rating;
}

/* End of accordion functions */


/* Start of Google Maps functions */

// Adds a marker to the map and an infowindow, takes a location (latitude and longitude) and JSON object
function addMarker(location, info_container) {
    var infowindow = new google.maps.InfoWindow({
        content: info_container.name
    });
    var marker = new google.maps.Marker({
        position: location,
        map: map,
        title: info_container.name
    });
    marker.addListener('click', function() {
        infowindow.open(map, marker);
    });
    markers.push(marker);
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
    setMapOnAll(null);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
    clearMarkers();
    markers = [];
}

// Initialize geocoder object provided by Google Maps API
function initializeGeocoder() {
    geocoder = new google.maps.Geocoder();
}

// Geocode function to capture user's location and center map around it
function codeAddress() {
    var address = document.getElementById('location').value;
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == 'OK') {
            map.setCenter(results[0].geometry.location);
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

// Callback function to initialize map once DOM is finished loading
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.09024, lng: -95.712891}, //center of the USA
        zoom: 8
    });

    var infowindow = new google.maps.InfoWindow({map: map});

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            infowindow.setPosition(pos);
            infowindow.setContent('You are here.');
            map.setCenter(pos);
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

// Function to handle Google Maps errors
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
}
/* End of Google Maps functions */