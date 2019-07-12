'use strict'

//###################################
// NPM MODULES
//###################################

const _                     = require('lodash');

//###################################
// LOCAL MODULES
//###################################

// const TransactionPersistence = require('../db/transaction');


//###################################
// INIT
//###################################

class BalanceService {

  async getBalance(userId) {

    if (!userId)
      throw new Error('invalid.user');

    const transactions = await TransactionPersistence.findByUserId(userId);

    return _.chain(transactions)
      .sortBy('timestamp')
      .map('amount')
      .reduce((prev, current) => prev += current, 0)
      .value();
  }

}

module.exports = new BalanceService();
