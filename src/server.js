const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const app = express()
const MongoClient = require('mongodb').MongoClient
require('dotenv').config('../.env')

// Connecting to MongoDB
let db;

MongoClient.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.dtjm7.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, (err, client) => {
  console.log('env', process.env.DB_USERNAME);
  if (err)
    return console.log(err)
  db = client.db(process.env.DB_CLUSTER)
  app.listen(process.env.PORT || 3002, () => {
    console.log(`listening on ${process.env.PORT}`)
  })
})

//middleware
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())
app.use(bodyParser.json())

// folder structure
app.use(express.static('public'))

// GET
app.get('/feed/:category', (req, res) => {
  db.collection('igLoadouts').find({category: req.params.category}).sort({dateCreated: -1}).limit(20).toArray()
  .then((result) => {
    res.send(result);
  })
})
app.get('/byhashtag/:hashtag', (req, res) => {
  const key = 'hashtags.'.concat(req.params.hashtag)
  db.collection('igLoadouts').find({
    [key]:true
  }).limit(10).toArray()
  .then((result) => {
    res.send(result);
  })
})
app.get('/:id', (req, res) => {
  console.log('req.params', req.params.id);
  db.collection('igLoadouts').findOne({
    _id: req.params.id,
  }, (err, result) => {
    res.send(result);
  })
});
app.get('/ui/:page/:category', (req, res) => {
  db.collection('discoverUI').findOne({
    //page: `${req.params.page}_${req.params.category}`,
    page: `discover_main`,
  }, (err, result) => {
    res.send(result);
  })
})
app.get('/', (req, res) => res.status(200).end());
// POST
// add loadout
app.post('/make', (req, res) => {
  db.collection('igLoadouts').insertOne(req.body, (err, result) => {
    if (err)
      return console.log(err)
  })
  res.status(200).end();
})

// send like
app.post('/likes/:id', (req, res) => {
  console.log('/POST LIKE');
  db.collection('igLoadouts')
  .findOneAndUpdate({
    _id: req.params.id
  }, {
    $inc: {
      likes: 1
    }
  }, {
      upsert: true,
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

// PUT
// add comment
app.put('/comments/:id', (req, res) => {
  console.log('/PUT req.params', req.params.id)
  db.collection('igLoadouts')
  .findOneAndUpdate({
    _id: req.params.id
  }, {
    $push: {
      comments: req.body,
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})


// DELETE
// app.delete('/messages', (req, res) => {
//   db.collection('messages').findOneAndDelete(
//     {name: req.body.name},
//     (err, result) => {
//     if (err) return res.send(500, err)
//     res.send({message: 'The message has been deleted'})
//   })
// })
