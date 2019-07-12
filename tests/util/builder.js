'use strict'

//###################################
// LOCAL MODULES
//###################################

const mongoose    = require('mongoose');
const casual      = require('casual');

const Transaction = mongoose.model('transaction');

//###################################
// INIT
//###################################

class Builder {

  createRandomTransaction(user, payment_method, extension = {}) {

    const params = this._getTransactionObject(user, payment_method, extension)

    return Transaction.create(params)
  }

  _getTransactionObject(user, payment_method, extension = {}) {

    const params = {
      value          : casual.double(0, 9999),
      description    : casual.text,
      payment_method,
      ...extension
    }

    Object.assign(params, {
      user        : user._id,
      credit_card : this._getCreditCard(extension.credit_card)
    })

    return params;
  }

  _getCreditCard(credit_card) {

    const cvv = casual.integer(0, 999);

    if (!credit_card)
      return { ...casual.card_data, cvv }

    return { ...credit_card, cvv }
  }
}


module.exports = new Builder();
