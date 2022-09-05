const express = require('express')
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const app = express()
require('dotenv').config('../.env')

const passport = require('passport');
const LocalStrategy = require('passport-local');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const MongoClient = require('mongodb').MongoClient

const logger = require('morgan');
const { doesNotMatch } = require('assert');


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
app.use(express.static(path.join(__dirname, 'public')));
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
app.get('/ui/:page/:category', (req, res) => {
  console.log('GET /ui/:page/:category')
  db.collection('discoverUI').findOne({
    //page: `${req.params.page}_${req.params.category}`,
    page: `discover_main`,
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
    if (err)
      return console.log(err)
  })
  res.status(200).end();
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
  console.log('GET /users/find')
  db.collection('Users')
  .findOne({ email: req.body.email }, (err, result) => {
    if (err) return res.send(err)
    res.send(result);
  })
})

// app.use(jwtCheck); // AUTHENTICATED ROUTES

app.post('/users/new', (req, res) => {
  console.log('/POST user', req.body);
  db.collection('Users')
  .findOne({ email: req.body.email}, (err, result) => {
    if (result?._id) {
      res.send('account associated with this email');
    } else {
        bcrypt.genSalt(10, (err, salt) => {
          if (err) { return next(err); }
          bcrypt.hash(req.body.password, salt, (err, hashedPassword) => {
            if (err) { return next(err); }
            db.collection('Users')
            .insertOne({
              email: req.body.email,
              password: hashedPassword,
              userName: req.body.userName || req.body.email,
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
