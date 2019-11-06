const express = require('express')
const request = require('request')
const mongodb = require('mongodb').MongoClient
const googmap = require('@google/maps')

// Server variables
const app = express()
const port = process.env.PORT || 3000

// Database variables
const DB_URL = process.env.MONGODB_URI

// Jobs api variables
const EVENT_API_URL = `https://jobs.api.sgf.dev/api/event?api_token=${process.env.JOBS_API_KEY}`
const JOB_API_URL = `https://jobs.api.sgf.dev/api/job?api_token=${process.env.JOBS_API_KEY}`

const googleMapsClient = googmap.createClient({
  key: process.env.GOOGLE_API_KEY
})

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

        const latLongJoined = jobs.map(function (element, index) {
          return `${element.lat},${element.long}`
        })

        const destinations = latLongJoined.join('|')

        googleMapsClient.distanceMatrix({
          units: 'imperial',
          origins: origin,
          destinations: destinations,
          mode: 'walking'
        }, function (err, response) {
          if (!err) {
            const elements = response.rows[0].elements

            const distanceValues = elements.map(function (element) {
              // in seconds
              // response.json.rows[0].elements[0].distance.text
              // response.json.rows[0].elements[0].duration.text
              return element.duration.distance.text
            })

            res.send({ response: distanceValues })
          }
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

  googleMapsClient.distanceMatrix({
    units: 'imperial',
    origins: origin,
    destinations: destinations,
    mode: 'walking'
  }, function (err, response) {
    if (!err) {
      const elements = response.rows[0].elements

      // in seconds
      // response.json.rows[0].elements[0].distance.text
      // response.json.rows[0].elements[0].duration.text
      response.send({
        response: elements.map(function (element) {
          return element.duration.distance.text
        })
      })
    }
  })
})

app.get('/', (req, res) => res.send({ README_MSG: 'NOTE!: Try out /google-api-test to test the google api works. /events/NUMBER and /jobs/NUMBER is currently be tested!' }))

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

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
