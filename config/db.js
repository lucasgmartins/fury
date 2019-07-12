'use strict';

//###################################
// NPM MODULES
//###################################

const router = require('hapi-router');

//###################################
// CONST
//###################################

const APP_ROUTES_PATTERN = 'app/api/*.js';

//###################################
// EXPORT
//###################################

module.exports.register = (server) => {

  const routeConfiguration = Object.freeze({
    plugin   : router,
    options  : {
      routes : APP_ROUTES_PATTERN
    }
  });

  return server.register(routeConfiguration);
}
