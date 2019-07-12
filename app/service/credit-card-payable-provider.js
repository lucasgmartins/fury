'use strict'

//###################################
// NPM MODULES
//###################################

const moment                = require('moment');

//###################################
// LOCAL MODULES
//###################################

const AbstractPayable     = require('./abstract-payable');

//###################################
// CONST
//###################################

const PAYABLE_STATUS = require('../model/payable-status')
const PAYABLE_FEE    = 0.05;
const PAYABLE_D30    = 30;

//###################################
// INIT
//###################################

class CreditCardPayableProvider extends AbstractPayable {

  applyStatus() {
    return PAYABLE_STATUS.WAITING_FUNDS;
  }

  applyFee(transaction) {
    return transaction.value - (transaction.value * PAYABLE_FEE)
  }

  applyPayementDate(transaction) {
    return moment(transaction.created_at).add(PAYABLE_D30, 'd');
  }
}

module.exports = new CreditCardPayableProvider();
