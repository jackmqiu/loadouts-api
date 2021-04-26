import dotenv from 'dotenv';

dotenv.config();

function bool(str) {
  if (str === undefined) {
    return false;
  }

  return str.toLowerCase() === 'true';
}

function int(str) {
  if (!str) {
    return 0;
  }

  return parseInt(str, 10);
}

// function float(str) {
//   if (!str) {
//     return 0;
//   }

//   return parseFloat(str, 10);
// }

const config = {
// App behavior
  appEnv: process.env.NODE_ENV,
  port: int(process.env.PORT) || 3002,
  log: {
    level: process.env.LOG_LEVEL || 'info',
    colorize: bool(process.env.LOG_COLORIZE) || false,
  },
  // Number of web cluster processes to fork
  webConcurrency: int(process.env.WEB_CONCURRENCY) || 1,

  // Number of worker cluster processes to fork
  // workerConcurrency: int(process.env.WORKER_CONCURRENCY) || 1,
  // pg: {
  //   uri: process.env.PG_URI,
  //   poolMax: int(process.env.PG_POOL_MAX),
  // },
  // auth0: {
  //   jwksURI: process.env.AUTH0_JWKS_URI,
  //   audience: process.env.AUTH0_AUDIENCE,
  //   issuer: process.env.AUTH0_ISSUER,
  // },
};

export default config;
