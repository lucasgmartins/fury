'use strict'

// #######################################
// IMPORTS
// #######################################

const _         = require('lodash')
const mongoose  = require('mongoose')
const Q         = require('q')
const nconf     = require('nconf');

const mongo     = nconf.get('mongo')

// #######################################
// HANDLER
// #######################################

const setupMongoose = async server => {

  const MONGO_OPTIONS = {
    ...mongo.options,
    useNewUrlParser: true,
    promiseLibrary : Q
  }

  const CONN_OPTIONS  = mongo.connmongo
  const DATABASE      = mongo.database
  const HOST          = mongo.host
  const USERNAME      = mongo.username
  const PASSWORD      = mongo.password

  const MONGODB_BASE_URL = USERNAME && PASSWORD ?
    `mongodb://${USERNAME}:${PASSWORD}@${HOST}/${DATABASE}` : `mongodb://${HOST}/${DATABASE}`

  const MONGODB_URL = CONN_OPTIONS ? `${MONGODB_BASE_URL}?${CONN_OPTIONS}` : MONGODB_BASE_URL

  mongoose.Promise = Q.Promise

  mongoose.connection
    .on('connected', () => {
      server.expose('mongoose', mongoose)
      server.expose('mongoose_connection', mongoose.connection)
    })

  server.ext('onPostStop', async () => {
    await mongoose.connection.close()
  })

  process.on('SIGINT', async () => {
    await mongoose.connection.close()
    process.exit(0)
  })

  if (!mongoose.connection.readyState) {
    await mongoose.connect(MONGODB_URL, MONGO_OPTIONS)
  }

  return mongoose.connection

}

// #######################################
// PLUGIN
// #######################################

const DatabasePlugin = {
  name: 'DatabasePlugin',
  version: '1.0.0',
  register: async (server) => {
    const connection = server.plugins.DatabasePlugin ? server.plugins.DatabasePlugin.mongoose_connection : undefined

    if (connection) {
      switch (connection.readyState) {
        case 1:
          return Promise.resolve(connection)
        case 3:
          await connection.close()
          break
      }
    }

    return setupMongoose(server)
  }
}

module.exports.register = server => {
  return server.register({
    plugin : DatabasePlugin
  });
}