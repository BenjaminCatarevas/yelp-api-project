// App ID
const CLIENT_ID = process.env.client_id

// App Secret
const CLIENT_SECRET = process.env.client_secret

// Import Yelp API Wrapper
const yelp = require('yelp-fusion')

// Import Express and Body-Parser for interfacing front-end with back-end
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

// Create an instance of the Express library
const app = express()

// Middleware
app.use(bodyParser.json()); // For parsing application/json
app.use(bodyParser.urlencoded({ extended: false })) // To properly load the json body
app.use(cors()) // To avoid any server header errors 

// Generate access token and make a yelp client to query the API -- since generating the token generates a promise, we have to latch onto it when a .then to actually obtain the token, and, subsequently, the client

// Create a var called client to capture the yelp client created by passing the credentials it to the yelp instance
var client;
const token = yelp.accessToken(CLIENT_ID, CLIENT_SECRET).then(response => {
    client = yelp.client(response.jsonBody.access_token);
}).catch(err => {
    console.error(err);
});

// Listen on Heroku's port
app.listen(process.env.PORT || "3000", function () {
    console.log('Successfully listening on Port 3000!')
})

//Localhost
//app.listen(8080, function() {
//    console.log("Successfully listening on port 8080!");
//})


// We need to latch onto that with a then statement to evaluate it
app.post("/api/v1/recommendations", function(req, res, next) {
    console.log(req.body)
    var food, limit, location, radius, open; //define variables to contain post request parameters
    var food = req.body.food; // If it's an empty food term, it'll just return 0 results
    
    if (req.body.limit%1 != 0) { // If the user does not enter a decimal
        limit = 10; // Set the default to 10
    } 
    if (req.body.limit > 50) { //if the limit entered by the user is greater than 50
        limit = 50 //bound the limit to 50
    } else if (isNaN(req.body.limit)) {  //if the limit isn't a number
        limit = 10 // Default the limit to 10
    } else { // Meaning the user entered a valid number 
        limit = req.body.limit // Set the limit to whatever the user entered, because it's a valid number
    }

    location = req.body.location // If the user doesn't give a location, it'll return 0 results

    if (req.body.radius >= 25) { // If the radius is greater than 25 miles
        radius = 40000; // Set to max radius of 40000 meters
    } else if (isNaN(req.body.radius)) {
        radius = 16090; // Round to 10 miles, default
    } else {
        radius = Math.ceil(req.body.radius * 1609.344); // Convert miles to meters and rounds up
    }

    if (req.body.open) { //boolean whether to return currently open restaurants (true = only open restaurants, false = all)
        open = true;
    } else {
        open = false;
    }

    client.search({
        term: food, // Food type
        limit: limit, // How many results
        location: location, // Where
        radius: radius,
        open_now: open // All restaurants or currently open restaurants
    }).then(response => {
        res.status(200).json(response.jsonBody.businesses);
        // The above line sends a status code 200 to the client, and within that sends the JS object returned by the Yelp client in json format (a string) to the client as well
    }).catch(err => {
        console.error(err);
        res.status(500).json(err);
        // The above line sends a status code 500 to the client, and within that sends the json of the error
    })
})