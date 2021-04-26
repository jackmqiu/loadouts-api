
import express from 'express';

import PlanRouter from './planRouter';

class Router {
  constructor(app) {
    const routes = new express.Router();

    const planRouter = new PlanRouter(app);

    routes.use(planRouter.routes);
    this.routes = routes;
  }
}

export default Router;
