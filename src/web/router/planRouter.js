import express from 'express';
import { logger } from '../../services/logger';
const MongoClient = require('mongodb').MongoClient

MongoClient.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.dtjm7.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, (err, client) => {
  if (err) return console.error(err)
  console.log('Connected to Database')
  const db = client.db('loadouts')
  const loadoutsCollection = db.collection('loadouts')
})

class PlanRouter {
  constructor(app) {
    // const {
    //   activityQueries: Activity,
    //   scaffoldQueries: Scaffold,
    // } = app.models;

    const routes = new express.Router()
      .post('/make', (req, res, next) => {
        logger.info('/make', req.body);
        loadoutsCollection.insertOne(req.body)
          .then(result => {
            console.log(result)
          })
          .catch(error => console.error(error))
      });
    this.routes = routes;
  }
}

export default PlanRouter;
