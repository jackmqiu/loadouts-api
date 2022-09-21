import express from 'express'
import path, { resolve } from 'path';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import cheerio from 'cheerio';
import axios from 'axios';
import fetch from 'node-fetch';
import AWS from 'aws-sdk'
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
})

const app = express()
import dotenv from 'dotenv';
dotenv.config('../.env');

import passport from 'passport';
import LocalStrategy from 'passport-local';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import logger from 'morgan';
import { doesNotMatch } from 'assert';

import MongoDB from 'connect-mongodb-session';
const MongoDBStore = MongoDB(session)
import { MongoClient } from 'mongodb';


// Connecting to MongoDB
const store = new MongoDBStore({
  uri: `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.dtjm7.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
  collection: process.env.DB_USERNAME,
});

let db;

MongoClient.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.dtjm7.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, (err, mongoClientPromise) => {
  console.log('env', process.env.DB_USERNAME);
  if (err)
    return console.log(err)
  db = mongoClientPromise.db(process.env.DB_CLUSTER)
})

passport.use(new LocalStrategy(function verify(email, password, cb) {
  db.collection('Users')
    .findOne({ email: email}, (err, result) => {
      if (err) { return cb(err); }
      if (!result) { return cb(null, false, { message: 'Incorrect username or password.' }); }
      bcrypt.compare(password, result.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          return cb(null, result);
        } else {
          return cb(null, false, "Wrong Password")
        }
      })
    })

}));

passport.serializeUser(function(user, cb) {
  cb(null, user._id)
});

passport.deserializeUser(function(id, cb) {
  db.collection('Users')
  .findOne({ _id: id}, (err, user) => {
    cb(err, user)
  })
});

//middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'keyboard cat',
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  store: store,
}));
app.use(passport.initialize());
app.use(passport.session());

// folder structure
app.use(express.static('public'))

//SCRAPE
app.post('/scrape', (req, res) => {
  console.log('/scrape', req.body.url)
  axios(req.body.url)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);
    const items = [];
    const productUrls = [];
    $('.image-wrap', html).each((index, element) => {
      const url = $(element).find('a').attr('href');
      url !== undefined && url !== 'undefined' && productUrls.push(url);
    })
    Promise.all(
        productUrls.map((productUrl) => {
        const item = {
          url: productUrl,
          gunType: ['gbb'],
          power: 'gas',
        };
        return new Promise ((resolve, reject) => {
          if (typeof productUrl !== 'string') {
            reject();
          }
          axios(productUrl)
          .then(async (response) => {
            const html = response.data;
            const $ = cheerio.load(html);
            const imageURL = $('.center-center').find('a > img').attr('src');
            const altText = $('.center-center').find('a > img').attr('alt');
            item.title = $('.product-info').find('h1').text();
            item.manufacturer = $('.left-center').find('a').text();
            if (imageURL) {
              const res = await fetch(imageURL)
              const blob = await res.buffer()
              const uploadedImage = await s3.upload({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: altText,
                Body: blob,
              }).promise()
              item.s3ImgURL = uploadedImage.Location;
            }
            $('.prod_content').find('p > b').each((index, element) => {
              const elementString = $(element).html();
              if (elementString === 'Overall Length') { //LENGTH
                const lengthString = $(element).next('span').text().substring(1)
                if (lengthString.includes('inch')) {
                  item.lengthUnits = 'in';
                } else {
                  item.lengthUnits = 'mm';
                }
                let lengthStrings = lengthString.split('-', 2);
                if (lengthStrings?.[0].includes('/')) {
                  lengthStrings = lengthStrings?.[0].split('/');
                }
                if (lengthStrings && lengthStrings.length > 1) {
                  item.foldedLength = parseInt(lengthStrings?.[0]);
                  item.length = parseInt(lengthStrings?.[1])
                } else {
                  item.length = parseInt(lengthStrings?.[0])
                }
              } else if (elementString === 'Weight') { //WEIGHT
                const weightString = $(element).next('span').text().substring(1);
                item.weight = parseInt(weightString);
                if (weightString?.includes('lb')) {
                  item.weightUnits = 'lb';
                } else {
                  item.weightUnits = 'g';
                }
              } else if (elementString === 'Magazine Capacity') { //MAG CAP
                item.capacity = parseInt($(element).next('span').text().substring(1))
              } else if (elementString === 'Muzzle Velocity') { //MUZZLE VELOCITY
                item.muzzleVelocity = parseInt($(element).next('span').text().substring(1));
              } else if (elementString === 'Fire Modes') { // FIRE MODES
                item.fireModes = $(element).next('span').text().substring(1);
              } else if (elementString === 'Gearbox') { //GEARBOX
                item.gearbox = $(element).next('span').text().substring(1);
              } else if (elementString === 'Barrel Thread') {
                item.barrelThread = $(element).next('span').text().substring(1);
              }
            })
            resolve(item)
          })
          .catch((err) => {
            console.log(err);
          })
        })
      })
    )
    .then((items) => {
      db.collection('items').insertMany(items, { ordered: false }, (err, results) => {
        if (err)
          return console.log(err);
      })
      res.send('done')
    })
    .catch((err) => {
      res.send(err)
    })
  })
})

// GET
app.get('/feed/:category/:page', (req, res) => {
  console.log('GET /feed/:category/:page')
  const skip = req.params.page && req.params.page * 6 || 0;
  console.log('skyp', skip)
  db.collection('igLoadouts').find({category: req.params.category}).skip(skip).limit(6).toArray()
  .then((result) => {
    res.send(result);
  })
})

app.get('/feed/:category', (req, res) => {
  console.log('GET /feed/:category')
  db.collection('igLoadouts').find({category: req.params.category}).sort({dateCreated: -1}).limit(20).toArray()
  .then((result) => {
    res.send(result);
  })
})

app.get('/byhashtag/:hashtag', (req, res) => {
  console.log('GET /byhastag/:hastag');
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
app.get('/ui/:category/:page', (req, res) => {
  console.log(`GET /ui/${req?.params?.category}/${req?.params?.page}`)
  db.collection('discoverUI').findOne({
    page: `${req.params.category}_${req.params.page}`,
  }, (err, result) => {
    res.send(result);
  })
})
app.get('/', (req, res) => {
  console.log('GET /')
  res.status(200).end()
});
// POST
// add loadout
app.post('/make', (req, res) => {
  db.collection('igLoadouts').insertOne(req.body, (err, result) => {
    if (err) {
      return console.log(err)
    }
    db.collection('Users')
    .findOneAndUpdate({ email: req.body.email }, {
      $push: {
        loadouts: req.body,
      },
    },
    {
      sort: {_id: -1},
      upsert: true
    },
    {
      upsert: true,
      returnDocument: 'after', // this is new !
    }, (err, results) => {
      if (err) {
        return console.log(err);
      }
    })
    res.status(200).json(result).end();
  })
})

// add build
app.post('/build/new', (req, res) => {
  db.collection('builds').insertOne(req.body, (err, results) => {
    if (err)
      return console.log(err);
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

//USER MANAGMENT
app.get(`/users/find`, (req, res) => {
  console.log('GET /users/find', req.query.email)
  db.collection('Users')
  .findOne({ email: req.query.email }, (err, result) => {
    if (err) return res.send(err)
    res.status(200).send(result);
  })
})

// app.use(jwtCheck); // AUTHENTICATED ROUTES

app.post('/users/new', (req, res) => {
  console.log('/POST user', req.body);
  db.collection('Users')
  .findOne({ email: req.body.email}, (err, result) => {
    if (result?._id) {
      res.send('account associated with this email');
    } else if (req.body.email.length > 0) {
        bcrypt.genSalt(10, (err, salt) => {
          if (err) { return next(err); }
          bcrypt.hash(req.body.password, salt, (err, hashedPassword) => {
            if (err) { return next(err); }
            db.collection('Users')
            .insertOne({
              email: req.body.email,
              password: hashedPassword,
              username: req.body.username || req.body.email,
            }, (err, result) => {
              if (err) return res.send(err)
              res.send(result);
            })
          });
        })
    }
  })
})

app.post('/login/password', (req, res, next) => {
  console.log('POST /login/password', req.body)
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(400).json({ errors: err })
    } 
    if (!user) {
      return res.status(400).json({ errors: "No users found"})
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(400).json({ errors: err })
      }
      return res.status(200).json({ success: user })
    })
  })(req, res, next)
});

app.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    return res.status(200).json({ success: "logged out"})
  });
});

// DELETE
// app.delete('/messages', (req, res) => {
//   db.collection('messages').findOneAndDelete(
//     {name: req.body.name},
//     (err, result) => {
//     if (err) return res.send(500, err)
//     res.send({message: 'The message has been deleted'})
//   })
// })

app.listen(process.env.PORT || 3002, () => console.log(
  `Example app listening on port ${3002}`
));
