'use strict';

//###################################
// NPM MODULES
//###################################

const JWT   = require('jsonwebtoken');
const nconf = require('nconf');

//###################################
// CONST
//###################################

const SECRET = nconf.get('auth:jwt:secret');

//###################################
// EXPORTS
//###################################

module.exports.sign = (user) => JWT.sign(user, SECRET);