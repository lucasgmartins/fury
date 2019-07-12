'use strict';

//###################################
// NPM MODULES
//###################################

const HapiSwagger = require('hapi-swagger');
const Inert       = require('inert');
const Vision      = require('vision')
const Pack        = require('../package');

//###################################
// CONST
//###################################

const SWAGGER_OPTIONS   = Object.freeze({
  plugin  : HapiSwagger,
  options : {
    info: {
      title   : 'API Documentation',
      version : Pack.version
    },
  }
});

///###################################
// CONST
//###################################

module.exports.register = async (server) => {

  await server.register([
    Inert,
    Vision,
    SWAGGER_OPTIONS
  ]);

  return Promise.resolve();
}
