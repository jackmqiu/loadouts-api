import express from 'express';
import { logger } from '../../services/logger';


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
