// import { logger } from '../services/logger';

const notFound = (res) => {
  res.status(404).json({ status: 404, message: 'Not Found' });
};

const httpErrors = (err, req, res, next) => {
  if (res.headersSent) {
    // Refer to https://expressjs.com/en/guide/error-handling.html
    // Delegate to the default error handling mechanisms in Express,
    // when the headers have already been sent to the client
    next(err);
  }

  switch (err.status) {
    case 401:
    case 403:
      res.status(401).json({ status: 401, message: 'Unauthorized' });
      break;
    case 404:
      notFound(res);
      break;
    case 409:
      res.status(409).json({ status: 409, message: 'Conflict' });
      break;
    case 500:
    default:
      // logger.info(err);
      res.status(500).json({ status: 500, message: 'Internal Server Error' });
      break;
  }
};

export { httpErrors, notFound };
