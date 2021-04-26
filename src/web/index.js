import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import Router from './router';

class Web {
  constructor(app) {
    const service = express();

    const router = new Router(app);

    service.get('/', (req, res) => res.status(200).end());

    // Middleware
    service.use(cors());

    // More Middleware
    service.use(bodyParser.json());
    service.use(bodyParser.urlencoded({ extended: true }));

    // Routes
    service.use(router.routes);

    // HTTP Errors
    service.on('error:404', res => notFound(res));
    service.use((req, res) => notFound(res));

    this.service = service;
  }
}

export default Web;
