'use strict'

//###################################
// NPM MODULES
//###################################

const _                     = require('lodash');
const mongoose              = require('mongoose');

//###################################
// LOCAL MODULES
//###################################

const Transaction = mongoose.model('transaction');

//###################################
// CONST
//###################################

const CREDIT_CARD_LAST_DIGITS = 4
const CREDIT_CARD_NUMBER_PATH = 'credit_card.number'

//###################################
// INIT
//###################################


class TransactionService {

  async create(userId, params) {

    const number = this._getHiddenCreditCardNumber(params);

    _.set(params, CREDIT_CARD_NUMBER_PATH, number);

    return Transaction.create({ user: userId, ...params});
  }

  async listByUser(userId) {
    return Transaction.find({ user: userId })
      .sort({ created_at: -1 })
      .lean();
   }

  _getHiddenCreditCardNumber(params) {

    const { number } = params.credit_card;

    const start = number.length - CREDIT_CARD_LAST_DIGITS;
    const end   = number.length;

    return number.substring(start, end);
  }

}

module.exports = new TransactionService();
