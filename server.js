const express = require('express')
const request = require('request')
const mongodb = require('mongodb').MongoClient
const googmap = require('@google/maps')

// Server variables
const app = express()
const port = process.env.PORT || 3000

// Database variables
const DB_URL = process.env.MONGODB_URI

const EVENT_API_URL = `https://jobs.api.sgf.dev/api/event?api_token=${process.env.JOBS_API_KEY}`
const JOB_API_URL = `https://jobs.api.sgf.dev/api/job?api_token=${process.env.JOBS_API_KEY}`
const walking = 'walking'
const driving = 'driving'
const bicycling = 'bicycling'
const transit = 'transit'
const googleMapsClient = googmap.createClient({
  key: process.env.GOOGLE_API_KEY
})

/**
 * This function wraps the google distance api in a async function.
 * @param {String} origin the current location of the user
 * @param {Array} destArr a array of addresses or lat long
 * @param {String} travelMode the mode of travel
 * @param {Function} callback a callback function to run once a response has occurred
 */
async function getDistancesAndDurations (origin, destArr, travelMode, callback) {
  var handleResponse = function (err, response) {
    if (!err) {
      var distancesAndDurations = response.json.rows[0].elements.map(function (element) {
        return { distance: element.distance.text, duration: element.duration.text }
      })
      callback(distancesAndDurations)
    } else {
      console.error(err)
    }
  }

  await googleMapsClient.distanceMatrix({
    units: 'imperial',
    origins: origin,
    destinations: destArr.join('|'),
    mode: travelMode
  }, await handleResponse)
}

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
      console.error(e)
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
            payrate: element.pay_rate,
            locations: element.locations.data.map((element) => {
              return `${element.name} ${element.street} ${element.city} ${element.state} ${element.state}`
            })

          }
        })

        res.send({ response: jobs })

        // const destinations = jobs.map((element) => {
        //   return element.locations
        // })
        // const jobIds = jobs.map((element) => {
        //   return element.id
        // })
      })
    } catch (e) {
      console.error(e)
      res.send('done with error')
    }
  })
})

app.get('/google-api-test', function (req, res, next) {
  const origin = '405 N Jefferson Ave, Springfield, MO 65806'
  const destinations = ['1423 N Jefferson Ave, Springfield, MO 65802']

  // easy as 1, 2, 3 and 4
  getDistancesAndDurations(origin, destinations, walking, (resp1) => {
    getDistancesAndDurations(origin, destinations, driving, (resp2) => {
      getDistancesAndDurations(origin, destinations, bicycling, (resp3) => {
        getDistancesAndDurations(origin, destinations, transit, (resp4) => {
          const allDistancesAndDurations = { walking: resp1, driving: resp2, bicycling: resp3, transit: resp4 }
          res.send({ response: allDistancesAndDurations })
        })
      })
    })
  })
})

app.get('/', (req, res) => res.send(`<p>NOTE!: Try out /google-api-test to test the google api.</p>
<p>try out /events/{number} or /jobs/{number}</p>`))

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
      res.send('done with error')
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
      res.send('done with error')
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

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
