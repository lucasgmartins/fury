'use strict';

//###################################
// NPM MODULES
//###################################

const Hapi        = require('@hapi/hapi');
const nconf       = require('nconf');
const uuid        = require('uuid');
const fs          = require('fs');

nconf
  .argv()
  .env({ separator:'__' })
  .file(process.env.PROPERTIES || './config/env/test.json');

fs.readdirSync('./app/model')
  .forEach(file => require(`./app/model/${file}`))

//###################################
// LOCAL MODULES
//###################################

const AuthConfig      = require('./config/auth');
const RouteConfig     = require('./config/router');
const SwaggerConfig   = require('./config/swagger');
const DatabaseConfig  = require('./config/plugins/database-plugin');
const JoiOptions      = require('./config/joi');

//###################################
// CONST
//###################################

const PORT            = nconf.get('app:port');

const HAPI_CONFIGURATIONS = {
  port   : PORT,
  routes : {
    ...JoiOptions
  }
}

//###################################
// INIT
//###################################

async function bootstrap(id = uuid.v4()) {

  const context = `[${id}]`;

  try {

    console.log(`${context} Starting`);
    const server  = new Hapi.Server(HAPI_CONFIGURATIONS);

    console.log(`${context} Starting register configurations`);

    await AuthConfig.register(server);
    await RouteConfig.register(server);
    await SwaggerConfig.register(server);
    await DatabaseConfig.register(server);

    await server.start();

    console.log(`${context} App is running at port=${PORT}`);

    return server;

  } catch (error) {
    console.log(`${context} Startup failed error=${error.message} stack=${error.stack}`);
    process.exit(1);
  }
}

process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
  })
  .on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown');
    process.exit(1);
  });

module.exports = bootstrap;
