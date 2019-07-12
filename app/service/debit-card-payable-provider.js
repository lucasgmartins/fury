'use strict'

//###################################
// LOCAL MODULES
//###################################

const AbstractPayable     = require('./abstract-payable');

//###################################
// CONST
//###################################

const PAYABLE_STATUS = require('../model/payable-status')
const PAYABLE_FEE    = 0.03;

//###################################
// INIT
//###################################

class DebitCardPayableProvider extends AbstractPayable {

  applyStatus() {
    return PAYABLE_STATUS.PAID;
  }

  applyFee(transaction) {
    return transaction.value - (transaction.value * PAYABLE_FEE)
  }

  applyPayementDate(transaction) {
    return transaction.created_at;
  }
}

module.exports = new DebitCardPayableProvider();
