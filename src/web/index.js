import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
const MongoClient = require('mongodb').MongoClient


// import Router from './router';

class Web {
  constructor(app) {
    const service = express();

    MongoClient.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.dtjm7.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, (err, client) => {
      if (err) return console.error(err)
      console.log('Connected to Database')
      const db = client.db('loadouts')
      const loadoutsCollection = db.collection('loadouts')

      service.post('/make', (req, res, next) => {
        logger.info('/make', req.body);
        loadoutsCollection.insertOne(req.body)
          .then(result => {
            console.log(result)
          })
          .catch(error => console.error(error))
      });
    })
    // const router = new Router(app);

    service.get('/', (req, res) => res.status(200).end());

    // Middleware
    service.use(cors());

    // More Middleware
    service.use(bodyParser.json());
    service.use(bodyParser.urlencoded({ extended: true }));

    // Routes
    // service.use(router.routes);

    // HTTP Errors
    service.on('error:404', res => notFound(res));
    service.use((req, res) => notFound(res));

    this.service = service;
  }
}

export default Web;
