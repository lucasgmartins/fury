'use strict'

//###################################
// NPM MODULES
//###################################

const chai           = require('chai');
const chaiAsPromised = require('chai-as-promised');
const casual         = require('casual');
const mongoose       = require('mongoose');
const _              = require('lodash');

chai.use(chaiAsPromised);
const should         = chai.should();

//###################################
// LOCAL MODULES
//###################################

const bootstrap              = require('../../server');
const TransactionService     = require('../../app/service/transaction');
const Builder                = require('../util/builder');

const User                   = mongoose.model('user');
const Transaction            = mongoose.model('transaction');

//###################################
// INIT
//###################################

describe('Transaction', () => {

  let server

  before(async () => {
    server = await bootstrap()
  })

  beforeEach(async () => {
    await server.plugins.DatabasePlugin.mongoose.connection.dropDatabase()
  })

  after(async () => {
    await server.stop()
    server = undefined
  })

  context('create', () => {

    it('should make transaction', async () => {

      const user         = await User.create({ name: casual.name, email: casual.email })
      const _transaction = await Builder.createRandomTransaction(user, 'debit_card');
      const transaction  = await Transaction.findOne();

      should.exist(transaction);
      should.exist(transaction._id);
      should.exist(transaction.credit_card);

      transaction.value.should.be.eql(_transaction.value);
      transaction.user.should.be.eql(_transaction.user);
      transaction.description.should.be.eql(_transaction.description);
      transaction.payment_method.should.be.eql(_transaction.payment_method);

      const { credit_card } = transaction;

      should.exist(credit_card.number);
      credit_card.holder_name.should.be.eql(_transaction.credit_card.holder_name);
      credit_card.exp.should.be.eql(_transaction.credit_card.exp);
    })

    it('should make transaction and escape sensitive date (credit_card number)', async () => {

      const credit_card = casual.card_data;

      const user        = await User.create({ name: casual.name, email: casual.email })

      const params      = Builder._getTransactionObject(user, 'debit_card', { credit_card });
      const transaction = await TransactionService.create(user._id, params);

      should.exist(transaction);
      should.exist(transaction.credit_card);

      const { number }  = transaction.credit_card;
      const lastNumbers = credit_card.number.substring(credit_card.number.length - 4, credit_card.number.length);

      number.should.be.eql(lastNumbers)

    })

  })

  context('list', () => {

    it('should make transaction', async () => {

      const user1      = await User.create({ name: casual.name, email: casual.email })
      const user2      = await User.create({ name: casual.name, email: casual.email })
      const [ t1, t2 ] = await Promise.all([
        Builder.createRandomTransaction(user1, 'debit_card'),
        Builder.createRandomTransaction(user1, 'debit_card'),
        Builder.createRandomTransaction(user2, 'credit_card')
      ]);

      const transactions = await TransactionService.listByUser(user1);

      should.exist(transactions);

      transactions.should.have.lengthOf(2);

      transactions.map(t => t._id.toString())
        .should.to.have.members([t1._id.toString(), t2._id.toString()])
    })

  })

});

