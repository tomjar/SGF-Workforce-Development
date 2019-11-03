const express = require('express');
const request = require('request');
const mongodb = require('mongodb').MongoClient;

// Server variables
const app = express();
const port = process.env.PORT || 3000;

// Database variables 
// workforce
// MONGODB_URI
const db_url = process.env.MONGODB_URI;

// Jobs api variables 
const api_token = 'k6o0ANdEQWtHWaWNXmlbHQ3E5YPUAQUN4EmSeftJfd8GtCa9xD4WmKrudLaVisFeOcrhbEynzqdMJ8Tz';
const api_url = `https://jobs.api.sgf.dev/api/event?api_token=${api_token}`;

app.get('/jobs/10', function (req, res) {
    mongodb.connect(db_url, (err, client) => {
        if (err) throw err;

        var db = client.db(process.env.MONGODB_NAME);

        try {
            var query = db.collection("jobs").find({}).toArray(function (err, result) {
                if (err) throw err;
                var tenJobs = result.slice(0, 10);
                // 37.2119519,-93.2925957
                let efactoryLatLong = '37.2119519,-93.2925957';

                getJobsAndDistances(efactoryLatLong, tenJobs, function (response) {
                    res.send({ 'response': response });
                });
            });
        } catch (e) {
            console.log(e);
            res.send('done with error');
        }
    });
});

app.get('/googleapi', function (req, res) {
    let currentAddress = '405 N Jefferson Ave, Springfield, MO 65806',
        jobAddress = '1423 N Jefferson Ave, Springfield, MO 65802';

    getDistance(currentAddress, jobAddress, 'bicycling', function (response) {
        res.send({ 'response': response });
    });

});

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/jobs/5', (req, res) => {
    let jobsJson = {
        data: [
            { description: 'The quick brown fox jumps over the lazy dog.', id: '1', jobtitle: 'Programmer', company: 'Company 1', lat: 37.2196049, long: -93.2885553, cycling: 5, car: 5, bus: 5, walking: 5 },
            { description: 'The quick brown fox jumps over the lazy dog.', id: '2', jobtitle: 'Electrican', company: 'Company 2', lat: 37.2025157, long: -93.2940485, cycling: 6, car: 5, bus: 5, walking: 5 },
            { description: 'The quick brown fox jumps over the lazy dog.', id: '3', jobtitle: 'Plumber', company: 'Company 3', lat: 37.17444811, long: -93.2944777, cycling: 5, car: 5, bus: 5, walking: 5 },
            { description: 'The quick brown fox jumps over the lazy dog.', id: '4', jobtitle: 'Teacher', company: 'Company 4', lat: 37.1696595, long: -93.2516052, cycling: 9, car: 5, bus: 5, walking: 5 },
            { description: 'The quick brown fox jumps over the lazy dog.', id: '5', jobtitle: 'Janitor', company: 'Company 5', lat: 37.1655557, long: -93.2340958, cycling: 5, car: 5, bus: 5, walking: 5 }
        ]
    };

    res.send(jobsJson);
});

app.get('/jobs', (req, res) => {
    mongodb.connect(db_url, (err, client) => {
        if (err) throw err;

        var db = client.db(process.env.MONGODB_NAME);

        try {
            var query = db.collection("jobs").find({}).toArray(function (err, result) {
                if (err) throw err;
                res.send({ 'data': result });
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

                var db = client.db(process.env.MONGODB_NAME);

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

        var db = client.db(process.env.MONGODB_NAME);

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

/**
 * 
 * @param {String} currLat 
 * @param {String} currLong
 * @param {String} travelmode 
 * @param {Array} mojobs 
 * @param {Function} callback 
 */
function getJobsAndDistances(currLatLong, mojobs, callback) {

    var mojobsLatLong = mojobs.map(function (element, index) {
        return {
            id: element.id,
            title: element.title,
            description: element.description,
            lat: element.location.lat,
            long: element.location.lng,
            company: element.location.name,
            url: element.url,
            urlimg: element.url_image,
            phone: element.phone,
            emai: element.email
        }
    });


    var mojobsAndDistances = [];

    // var jobObj = {
    //     id: element.id,
    //     title: element.title,
    //     description: element.description,
    //     lat: element.location.lat,
    //     long: element.location.lng,
    //     company: element.location.name,
    //     url: element.url,
    //     urlimg: element.url_image,
    //     phone: element.phone,
    //     email: element.email,
    //     car,
    //     bicycle,
    //     bus,
    //     walk
    // };


    for (let i = 0; i < mojobsLatLong.length; i++) {

        let jobLatLong = `${mojobsLatLong[i].lat},${mojobsLatLong[i].long}`;
        getDistance(currLatLong, jobLatLong, function (response) {
            let jobAndDistance = mojobsAndDistances[i];

            jobAndDistance.car = response.car;
            jobAndDistance.walk = response.walk;
            jobAndDistance.bus = response.bus;
            jobAndDistance.bicycle = response.bicycle;


            mojobsAndDistances.push(jobAndDistance);

        });
    }

    callback(mojobsAndDistances);
}

// travel mode is optional
// danger have some sensible defaults!
/**
 * 
 * @param {*} currLat 
 * @param {*} currLong 
 * @param {Array} jobLatAndLongsArr 
 * @param {*} travelmode 
 * @param {*} callback 
 */
function getDistance(currLatLong, jobLatLong, callback) {
    // https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=40.6655101,-73.89188969999998&destinations=40.6905615%2C-73.9976592%7C40.6905615%2C-73.9976592%7C40.6905615%2C-73.9976592%7C40.6905615%2C-73.9976592%7C40.6905615%2C-73.9976592%7C40.6905615%2C-73.9976592%7C40.659569%2C-73.933783%7C40.729029%2C-73.851524%7C40.6860072%2C-73.6334271%7C40.598566%2C-73.7527626%7C40.659569%2C-73.933783%7C40.729029%2C-73.851524%7C40.6860072%2C-73.6334271%7C40.598566%2C-73.7527626&key=YOUR_API_KEY
    const googleMapsClient = require('@google/maps').createClient({
        key: 'AIzaSyDpQoxtbTKGtDD2Cg2F33P6rqhAfoq3GVM'
    });

    // Geocode an address.
    googleMapsClient.distanceMatrix({
        units: 'imperial',
        origins: currLatLong,
        destinations: jobLatLong
    }, function (err, response) {

        if (!err) {
            callback({ car: -1, walk: -1, bus: -1, bicycle: -1 });
        } else {
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
