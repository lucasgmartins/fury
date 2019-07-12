'use strict'

//###################################
// LOCAL MODULES
//###################################

const DebitCardPayableProvider  = require('./debit-card-payable-provider');
const CreditCardPayableProvider = require('./credit-card-payable-provider');

//###################################
// CONST
//###################################

const PayableProviderMap = {
  credit_card : CreditCardPayableProvider,
  debit_card  : DebitCardPayableProvider,
}

//###################################
// INIT
//###################################


class PayableService {

  create(transaction) {
    return PayableProviderMap[transaction.payment_method].process(transaction);
  }
}

module.exports = new PayableService();
