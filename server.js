const express = require('express')
const request = require('request')
const mongodb = require('mongodb').MongoClient

// Server variables
const app = express()
const port = process.env.PORT || 3000

// Database variables
const DB_URL = process.env.MONGODB_URI

// Jobs api variables
const EVENT_API_URL = `https://jobs.api.sgf.dev/api/event?api_token=${process.env.JOBS_API_KEY}`
const JOB_API_URL = `https://jobs.api.sgf.dev/api/job?api_token=${process.env.JOBS_API_KEY}`

app.get('/events/:count', function (req, res, next) {
  let count = parseInt(req.params.count)
  if (typeof count !== 'number') res.send({ message: 'sorry not a number' })
  if (count > 15) {
    count = 15
  }
  mongodb.connect(DB_URL, (err, client) => {
    if (err) throw err

    var db = client.db(process.env.MONGODB_NAME)

    try {
      db.collection('events').find({}).toArray(function (err, result) {
        if (err) throw err

        var events = result.slice(0, count).map(function (element, index) {
          return {
            url: element.url,
            urlimg: element.url_image,
            phone: element.phone,
            email: element.email,
            description: element.description,
            id: element.id.toString(),
            jobtitle: element.title,
            company: element.company,
            lat: element.location.lat,
            long: element.location.lng
          }
        })
        res.send({ data: events })
      })
    } catch (e) {
      console.log(e)
      res.send('done with error')
    }
  })
})

app.get('/jobs/:count', function (req, res, next) {
  let count = parseInt(req.params.count)

  if (typeof count !== 'number') {
    res.send({ message: 'sorry not a number' })
  }

  if (count > 15) {
    count = 15
  }

  mongodb.connect(DB_URL, (err, client) => {
    if (err) throw err

    var db = client.db(process.env.MONGODB_NAME)

    try {
      db.collection('jobs').find({}).toArray(function (err, result) {
        if (err) throw err

        var jobs = result.slice(0, count).map(function (element, index) {
          return {
            url: element.url,
            description: element.description,
            id: element.id.toString(),
            jobtitle: element.title,
            jobtype: element.job_type,
            company: element.employer.name,
            payrate: element.pay_rate
          }
        })
        // 37.2119519,-93.2925957
        const origin = '37.2119519,-93.2925957'
        getJobsAndDistances(origin, jobs, function (response) {
          res.send({ response: response })
        })
      })
    } catch (e) {
      console.log(e)
      res.send('done with error')
    }
  })
})

app.get('/google-api-test', function (req, res) {
  const origin = '405 N Jefferson Ave, Springfield, MO 65806'
  const destinations = '1423 N Jefferson Ave, Springfield, MO 65802'

  getDistances(origin, destinations, function (response) {
    res.send({ response: response })
  })
})

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)

  // getting jobs and saving to mongo
  request.get(JOB_API_URL, (err, res, body) => {
    console.log(`using url: ${JOB_API_URL}`)
    if (!err) {
      var locals = JSON.parse(body)
      mongodb.connect(DB_URL, (err, client) => {
        if (err) throw err

        var db = client.db(process.env.MONGODB_NAME)

        try {
          db.collection('jobs').insertMany(locals.data)
        } catch (e) {
          console.log(e)
        }
      })
    } else {
      console.log(err)
    }
  })

  // getting events and saving to mongo
  request.get(EVENT_API_URL, (err, res, body) => {
    console.log(`using url: ${EVENT_API_URL}`)
    if (!err) {
      var locals = JSON.parse(body)

      mongodb.connect(DB_URL, (err, client) => {
        if (err) throw err

        var db = client.db(process.env.MONGODB_NAME)

        try {
          db.collection('events').insertMany(locals.data)
        } catch (e) {
          console.log(e)
        }
      })
    } else {
      console.log(err)
    }
  })
})

function shutdown () {
  mongodb.connect(DB_URL, (err, client) => {
    if (err) throw err

    var db = client.db(process.env.MONGODB_NAME)

    try {
      db.collection('jobs').drop((err, ok) => {
        if (err) throw err
        if (ok) console.log('Deleted jobs records')
      })

      db.collection('events').drop((err, ok) => {
        if (err) throw err
        if (ok) console.log('Deleted events records')
      })
    } catch (e) {
      console.log(e)
    }
  })

  process.exit(0)
}

/**
 *
 * @param {String} origin
 * @param {Array} mojobs
 * @param {Function} callback
 */
function getJobsAndDistances (origin, mojobs, callback) {
  // var mojobsLatLong = mojobs.map(function (element, index) {
  //     return {
  //         id: element.id,
  //         title: element.title,
  //         description: element.description,
  //         lat: element.location.lat,
  //         long: element.location.lng,
  //         company: element.location.name,
  //         url: element.url,
  //         urlimg: element.url_image,
  //         phone: element.phone,
  //         email: element.email
  //     }
  // });

  const latLongJoined = mojobs.map(function (element, index) {
    return `${element.lat},${element.long}`
  })

  const destinations = latLongJoined.join('|')

  getDistances(origin, destinations, function (response) {
    callback(response)
  })
}

/**
 * TODO
 * @param {String} origin
 * @param {String} destinations
 * @param {Function} callback
 */
function getDistances (origin, destinations, callback) {
  // https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=40.6655101,
  // -73.89188969999998&destinations=40.6905615%2C-73.9976592%7C40.6905615%2C-73.9976592%7C40.6905
  // 615%2C-73.9976592%7C40.6905615%2C-73.9976592%7C40.6905615%2C-73.9976592%7C40.6905615%2C-73.9
  // 976592%7C40.659569%2C-73.933783%7C40.729029%2C-73.851524%7C40.6860072%2C-73.6334271%7C40.5
  // 98566%2C-73.7527626%7C40.659569%2C-73.933783%7C40.729029%2C-73.851524%7C40.6860072%2C-73.633
  // 4271%7C40.598566%2C-73.7527626&key=YOUR_API_KEY
  const googleMapsClient = require('@google/maps').createClient({
    key: process.env.GOOGLE_API_KEY
  })

  // get that distance!
  googleMapsClient.distanceMatrix({
    units: 'imperial',
    origins: origin,
    destinations: destinations,
    mode: 'walking'
  }, function (err, response) {
    if (!err) {
      const elements = response.rows[0].elements
      const isArray = Array.isArray(elements)

      let distanceValues = []

      if (isArray) {
        distanceValues = elements.map(function (element) {
          // in seconds
          return element.duration.value
        })
        // distanceValues.join(',');
        callback(distanceValues)
      } else {
        // distanceValue;
        distanceValues.push(elements.duration.value)
        callback(distanceValues)
      }
    } else {
      console.log(err)
    }
  })
}

process.on('SIGKILL', shutdown)
process.on('SIGTERM', shutdown)
