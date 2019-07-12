'use strict'

//###################################
// NPM MODULES
//###################################

const mongoose = require('mongoose');
const Payable  = mongoose.model('payable');

//###################################
// INIT
//###################################

class AbstractPayable {

  async process(transaction) {

    const promises = [
      this.applyStatus(transaction),
      this.applyFee(transaction),
      this.applyPayementDate(transaction)
    ]

    const [ status, value, payment_date ] = await Promise.all(promises);

    const params = {
      user : transaction.user,
      status,
      value,
      transaction,
      payment_date
    }

    return Payable.create(params)
  }

  async applyStatus() {
    throw new Error('must.implement.status.method')
  }

  async applyFee() {
    throw new Error('must.implement.applyFee.method')
  }

  async applyPayementDate() {
    throw new Error('must.implement.applyPayementDate.method')
  }

}

module.exports = AbstractPayable;
