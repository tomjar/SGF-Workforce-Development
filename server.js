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
 * @param {String} currLatLong 
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

    console.log(mojobsAndDistances);
    callback(mojobsAndDistances);
}

// travel mode is optional
// TODO:  have some sensible defaults!
/**
 * 
 * @param {String} currLatLong 
 * @param {String} jobLatLong 
 * @param {Function} callback 
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
        destinations: jobLatLong,
        mode: 'walking'
    }, function (err, response) {

        if (!err) {
            console.log(response);
            let distanceArr = response.rows[0].elements.map(function(element){
                // in seconds
                return element.duration.value;
            });

            console.log(distanceArr);

            callback({car: -1, bicycle:-1, bus:-1, walk:-1});
            
        } else {
            console.log(err);
        }
    });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
