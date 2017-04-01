// App ID
const CLIENT_ID = 'LwyO2ipJjCw8Sro-cH6uAg'

// App Secret
const CLIENT_SECRET = '5Z2wbtMFIBby6YuuJ1rZtQTz5Bd0qDPR67fN6f0qeZ1CDGbuSp6DRKA5AD4oS8e9'

// Import Yelp API Wrapper and make an instance of it
const yelp = require('yelp-fusion')

//Import Express and Body-Parser for interfacing front-end with back-end
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

//Create an instance of the Express library
const app = express()

// Middleware
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: false })) //to properly load the json body
app.use(cors()) //to avoid any server header errors 

// Generate access token and make a yelp client to query the API -- since generating the token generates a promise, we have to latch onto it when a .then to actually obtain the token, and, subsequently, the client

//Create a var called client to capture the yelp client created by passing the credentials it to the yelp instance
var client
const token = yelp.accessToken(CLIENT_ID, CLIENT_SECRET).then(response => {
    client = yelp.client(response.jsonBody.access_token);
}).catch(err => {
    console.error(err);
});

//Listen on localhost
//app.listen(process.env.PORT || "3000", function () {
//    console.log('Example app listening on port 8080!')
//})

//app.listen(8080, function() {
//    console.log("Listening!");
//})

//we need to latch onto that with a then statement to evaluate it
app.post("/api/v1/recommendations", function(req, res, next) {
    console.log(req.body)
    var food, limit, location, radius, open; //define variables to contain post request parameters
    var food = req.body.food;
    if (req.body.limit > 50) { //if the limit entered by the user is greater than 50
        limit = 50 //bound the limit to 50
    } else if (isNaN(req.body.limit)) {  //if the limit isn't a number
        limit = 10 //default the bound to 10
    } else { //meaning the user entered a valid number 
        limit = req.body.limit //set the limit to whatever the user entered, because it's a valid number
    }
    
    location = req.body.location
    
    if (req.body.radius >= 25) { //if the radius is greater than 25 miles
        radius = 40000; //set to max radius of 40000 meters
    } else {
        radius = req.body.radius * 1609.344 //convert miles to meters
    }
    
    if (req.body.open) { //boolean whether to return currently open restaurants (true = only open restaurants, false = all)
        open = true;
    } else {
        open = false;
    }
    
    client.search({
        term: food, //food type
        limit: limit, //how many results
        location: location, //where
        radius: radius,
        open_now: open //all restaurants or currently open restaurants
    }).then(response => {
        //use jQuery to .append() the results to the DOM with a for loop
        res.status(200).json(response.jsonBody.businesses);
        //The above line sends a status code 200 to the client, and within that sends the JS object returned by the Yelp client in json format (a string) to the client as well
    }).catch(err => {
        console.error(err);
        res.status(500).json(err);
        //The above line sends a status code 500 to the client, and within that sends the json of the error
    })
})