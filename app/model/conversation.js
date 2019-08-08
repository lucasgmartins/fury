'use strict'

const mongoose = require('mongoose')

const Schema   = mongoose.Schema

const schema = new Schema({
  thread_id  : { type: String, required: true, trim: true },
  emails     : [{
    message_id : { type: String, required: true, trim: true },
    created_at : { type: Date  , required: true }
  }]

}, { collection : 'conversation'})

mongoose.model('conversation', schema, 'conversation')