import cluster from 'cluster';
import config from './config';
import App from './app';
import Web from './web';
import { logger } from './services/logger';

if (cluster.isMaster) {
  logger.info('Master process is up');
  logger.info(`Forking ${config.webConcurrency} workers`);

  // Fork workers.
  for (let i = 0; i < config.webConcurrency; i += 1) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    if (code !== 0) {
      const newWorker = cluster.fork();
      logger.info(`Worker ${worker.process.pid} died. Starting new worker ${newWorker.process.id}`);
    }

    logger.info(`Worker ${worker.process.pid} exited`, { code, signal });
  });
} else {
  const web = new Web(new App(config));
  web.service.listen(config.port, () => {
    logger.info(`Worker process is up and listening to port ${config.port}`);
  });
}
