/*
This is to submit a post request to the API through the form
*/
var map;
var geocoder;
var markers = [];

$(document).ready(function() { //when the document is fully loaded, initialize the geocoder variable
    initialize();
})

if (navigator.geolocation) { //add geolocation
    $("#form").submit(function (e) { //target the form
        // Get the action-url of the form
        deleteMarkers(); //clears array and map of markers
        codeAddress();
        var actionurl = e.currentTarget.action;

        $("#results").empty();
        //Reset the results div to hold the new results
        $.ajax({ //use AJAX for the post request
            url: actionurl,
            type: 'post',
            data: $("#form").serialize(),
            success: function (resp) {
                console.log(resp);
                $('#results').append('<div id="accordion"></div>');
                //The above line adds a div container to hold the results in accordion form
                if (resp.length == 0) { //Alerts user if no results are found
                    alert("No results found.");
                } else {
                    for (var i = 0; i < resp.length; i++) {
                        var data = resp[i]; //assign response to data var for legitiblity
                        var latLng = new google.maps.LatLng(data.coordinates.latitude, data.coordinates.longitude); //lat and long coords
                        addMarker(latLng)
                        //two functions, one for header that abstracts the h3 header with the resposne name
                        //another for the body that takes a bunch of parameters and returns the body as a string
                        $("#accordion").append(accordionName(resp[i]) + "\n" + 
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
                //Give each result the accordion characteristic
            },
            error: function (err) {
                console.error(err)
                alert ("Error: Unspecified value")
            }
        })

        // Prevent default functionality
        e.preventDefault();
    })
} else { //Replace with basic POST request with non-geolocation functionality
    alert("Geolocation is not supported on this browser")
}

function accordionName(response_body) { //Function to return the header for the accordion
    var name = response_body.name;
    return "<h3 id='result'>" + name + "</h3>";
}

function accordionLocation(response_body) {
    var address = response_body.location.address1;
    var stateZip = response_body.location.display_address[1];
    var country = response_body.location.country;
    var rating = response_body.rating;
    return address + ", " + stateZip + ", " + country;
}

function accordionPhone(response_body) {
    var phone = response_body.display_phone;
    return phone;
}

function accordionPrice(response_body) {
    var price = response_body.price;
    return price;
}

function accordionRating(response_body) {
    var rating = response_body.rating;
    return rating;
}

function addMarker(location) {
    var marker = new google.maps.Marker({
        position: location,
        map: map
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

// Shows any markers currently in the array.
function showMarkers() {
    setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
    clearMarkers();
    markers = [];
}

function initialize() {
    geocoder = new google.maps.Geocoder();
}

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

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.09024, lng: -95.712891}, //center of the USA
        zoom: 8
    });
    var infoWindow = new google.maps.InfoWindow({map: map});

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('You are here.');
            map.setCenter(pos);
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
}