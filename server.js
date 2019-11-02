const express = require('express'); 
const request = require('request'); 
const mongodb = require('mongodb').MongoClient;

// Server variables
const app = express(); 
const port = process.env.PORT || 3000;

// Database variables 
const db_url = 'mongodb://localhost:27017/workforce';

// Jobs api variables 
const api_token = 'k6o0ANdEQWtHWaWNXmlbHQ3E5YPUAQUN4EmSeftJfd8GtCa9xD4WmKrudLaVisFeOcrhbEynzqdMJ8Tz';
const api_url = `https://jobs.api.sgf.dev/api/event?api_token=${api_token}`; 

app.get('/googleapi', function(req, res){
    let currentAddress = '405 N Jefferson Ave, Springfield, MO 65806',
    jobAddress = '1423 N Jefferson Ave, Springfield, MO 65802';

    getDistance(currentAddress, jobAddress, 'bicycling', function(response){
        res.send({'response': response});
    });
    
});

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/jobs', (req, res) => {
    mongodb.connect(db_url, (err, client) => {
        if (err) throw err;

        var db = client.db('workforce');

        try {
            var query = db.collection("jobs").find({}).toArray(function (err, result) {
                if (err) throw err;
                res.send({'data': result}); 
            });
        } catch (e) {
            console.log(e);
            res.send('done with error'); 
        }
    }); 
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
    console.log(`using url: ${api_url}`)
    request.get(api_url, ((err, res, body) => {
        if (!err) {
            var locals = JSON.parse(body); 

            mongodb.connect(db_url, (err, client) => {
                if (err) throw err; 

                var db = client.db('workforce'); 

                try {
                    db.collection('jobs').insertMany(locals.data);
                } catch (e) {
                    console.log(e);
                }
            });
        } else {
            console.log(err);
        }
    }));
});

function shutdown() {
    mongodb.connect(db_url, (err, client) => {
                if (err) throw err; 

                var db = client.db('workforce'); 

                try {
                    db.collection('jobs').drop((err, ok) => {
                        if (err) throw err;
                        if (ok) console.log('Deleted records'); 
                    }); 
                } catch (e) {
                    console.log(e);
                }
            });

    process.exit(0); 
}

// travel mode is optional
function getDistance(currentAddress, jobAddress, travelmode, callback){
 // https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=40.6655101,-73.89188969999998&destinations=40.6905615%2C-73.9976592%7C40.6905615%2C-73.9976592%7C40.6905615%2C-73.9976592%7C40.6905615%2C-73.9976592%7C40.6905615%2C-73.9976592%7C40.6905615%2C-73.9976592%7C40.659569%2C-73.933783%7C40.729029%2C-73.851524%7C40.6860072%2C-73.6334271%7C40.598566%2C-73.7527626%7C40.659569%2C-73.933783%7C40.729029%2C-73.851524%7C40.6860072%2C-73.6334271%7C40.598566%2C-73.7527626&key=YOUR_API_KEY
    const googleMapsClient = require('@google/maps').createClient({
        key: 'AIzaSyDpQoxtbTKGtDD2Cg2F33P6rqhAfoq3GVM'
      });

      // Geocode an address.
        googleMapsClient.distanceMatrix({
            units: 'imperial',
            origins: currentAddress,
            destinations: jobAddress
        }, function(err, response){
            
            if (!err) {
                callback(response);
                }else{
                    console.log(err);
                }
        });

      // googleMapsClient.distanceMatrix

    // GoogleMapsLoader.KEY = 'AIzaSyDpQoxtbTKGtDD2Cg2F33P6rqhAfoq3GVM';
    // GoogleMapsLoader.LIBRARIES = ['geometry', 'places'];
    // GoogleMapsLoader.LANGUAGE = 'eng';
    // GoogleMapsLoader.REGION = 'USA';

    // GoogleMapsLoader.onLoad(function(google) {
        
    // });

    // GoogleMapsLoader.release(function() {
    //     console.log('No google maps api around');
    // });

    // var origin1 = new google.maps.LatLng(55.930385, -3.118425);

    // var destinationA = 'Stockholm, Sweden';
    // var destinationB = new google.maps.LatLng(50.087692, 14.421150);
    
    // var service = new google.maps.DistanceMatrixService();
    // service.getDistanceMatrix(
    //   {
    //     origins: [origin1, origin2],
    //     destinations: [destinationA, destinationB],
    //     travelMode: 'DRIVING',
    //     transitOptions: TransitOptions,
    //     drivingOptions: DrivingOptions,
    //     unitSystem: UnitSystem,
    //     avoidHighways: Boolean,
    //     avoidTolls: Boolean,
    //   }, callback);
    
    // function callback(response, status) {
    //   // See Parsing the Results for
    //   // the basics of a callback function.
    //   console.log(response);
    // }
}

process.on('SIGINT', shutdown);

process.on('SIGTERM', shutdown);
