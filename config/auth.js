'use strict';

//###################################
// NPM MODULES
//###################################

const nconf           = require('nconf');
const jwt             = require('hapi-auth-jwt2');
const bell            = require('@hapi/bell');
const mongoose        = require('mongoose');

//###################################
// LOCAL MODULES
//###################################

const User            = mongoose.model('user')

//###################################
// CONST
//###################################

const GOOGLE_CLIENT_ID  = nconf.get('GOOGLE_CLIENT_ID');
const GOOGLE_SECRET_ID  = nconf.get('GOOGLE_SECRET_ID');
const GOOGLE_SCOPE      = [
  'https://www.googleapis.com/auth/plus.login',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar'
];

const JWT_SECRET        = nconf.get('auth:jwt:secret');
const JWT_ALGORITHM     = 'HS256'

const AUTH_STRATEGY     = 'jwt';
const AUTH_CONFIGRAITON = Object.freeze({
  key           : JWT_SECRET,
  validate      : validate,
  verifyOptions : { algorithms: [ JWT_ALGORITHM ] },
});

///###################################
// INIT
//###################################

 async function validate(decoded) {

  const user = await User.findOne({ email: decoded.email }).lean();

  if (user)
    return { isValid: true };
  else
    return { isValid: false };
};

module.exports.register = async (server) => {

  await setJwtStrategy(server);
  await setupGoogleStrategy(server);

  return Promise.resolve();
}

async function setJwtStrategy(server) {

  await server.register(jwt);

  server.auth.strategy(AUTH_STRATEGY, AUTH_STRATEGY, AUTH_CONFIGRAITON);
  server.auth.default(AUTH_STRATEGY);
}

async function setupGoogleStrategy(server) {

  await server.register(bell)

  server.auth.strategy('google', 'bell', {
    provider        : 'google',
    password        : 'cookie_encryption_password_secure',
    isSecure        : false,
    location        : 'http://localhost:9000',
    clientId        : GOOGLE_CLIENT_ID,
    clientSecret    : GOOGLE_SECRET_ID,
    scope           : GOOGLE_SCOPE,
      providerParams  : {
        access_type: 'offline'
      },
  });
}

