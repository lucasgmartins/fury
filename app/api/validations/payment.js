'use strict'

//###################################
// NPM MODULES
//###################################

const Joi = require('@hapi/joi');

//###################################
// CONST
//###################################

const PAYMENT_METHOD = require('../../model/payment-method');
const PAYMENT_STATUS = require('../../model/payable-status');

//###################################
// EXPORTS
//###################################

module.exports = {
 cashIn : {
  payload : {
    value           : Joi.number().positive().required(),
    payment_method  : Joi.string().valid(PAYMENT_METHOD.DEBIT_CARD, PAYMENT_METHOD.CREDIT_CARD),
    description     : Joi.string().required(),
    credit_card     : {
      type        : Joi.string(),
      number      : Joi.string().required(),
      exp         : Joi.string().required(),
      holder_name : Joi.string().required(),
      cvv         : Joi.number().positive().min(0).max(999).required()
    }
  }
 },
 cashOut : {
  params: {
    id: Joi.string().length(24).required()
  }
 },
 payables : {
  query: {
    status: Joi.string().valid(PAYMENT_STATUS.WAITING_FUNDS, PAYMENT_STATUS.PAID).required()
  }
 }
}