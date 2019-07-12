'use strict'

//###################################
// NPM MODULES
//###################################

const chai           = require('chai');
const chaiAsPromised = require('chai-as-promised');
const casual         = require('casual');
const mongoose       = require('mongoose');
const moment         = require('moment');
const sinon          = require('sinon');

chai.use(chaiAsPromised);
const should         = chai.should();

//###################################
// LOCAL MODULES
//###################################

const bootstrap                 = require('../../server');
const PayableService            = require('../../app/service/payable-service');
const DebitCardPayableProvider  = require('../../app/service/debit-card-payable-provider');
const CreditCardPayableProvider = require('../../app/service/credit-card-payable-provider');

const Builder                   = require('../util/builder');

const User                   = mongoose.model('user');
const Payable                = mongoose.model('payable');

//###################################
// CONST
//###################################

const PAYMENT_METHOD        = require('../../app/model/payment-method');
const PAYABLE_STATUS        = require('../../app/model/payable-status');

//###################################
// INIT
//###################################

describe('Payable', () => {

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

  context('payable', () => {

    it('should call debit card payable provider when transaction is debit_card', async () => {

      const user        = await User.create({ name: casual.name, email: casual.email })
      const transaction = await Builder.createRandomTransaction(user, PAYMENT_METHOD.DEBIT_CARD);

      const spy = sinon.spy(DebitCardPayableProvider, 'process');

      try {

        await PayableService.create(transaction);

        sinon.assert.calledOnce(spy);

        const payable = await Payable.findOne();

        should.exist(payable);
        should.exist(payable.status);
        should.exist(payable.value);
        should.exist(payable.payment_date);

      } finally {
        spy.restore();
      }

    })

    it('should call credit card payable provider when transaction is credit_card', async () => {

      const user        = await User.create({ name: casual.name, email: casual.email })
      const transaction = await Builder.createRandomTransaction(user, PAYMENT_METHOD.CREDIT_CARD);

      const spy = sinon.spy(CreditCardPayableProvider, 'process');

      try {

        await PayableService.create(transaction);

        sinon.assert.calledOnce(spy);

        const payable = await Payable.findOne();

        should.exist(payable);
        should.exist(payable.status);
        should.exist(payable.value);
        should.exist(payable.payment_date);

      } finally {
        spy.restore();
      }

    })
  })

  context('debit card', () => {

    it('should apply status of paid', async () => {

      const user        = await User.create({ name: casual.name, email: casual.email })
      const transaction = await Builder.createRandomTransaction(user, PAYMENT_METHOD.DEBIT_CARD);

      const status      = await DebitCardPayableProvider.applyStatus(transaction)

      should.exist(status);

      status.should.be.eql(PAYABLE_STATUS.PAID);
    })

    it('should apply fee in value (3%)', async () => {

      const user        = await User.create({ name: casual.name, email: casual.email })
      const transaction = await Builder.createRandomTransaction(user, PAYMENT_METHOD.DEBIT_CARD, { value : 100 });

      const value = await DebitCardPayableProvider.applyFee(transaction)

      should.exist(value);

      value.should.be.eql(97);
    })

    it('should apply payment date', async () => {

      const user        = await User.create({ name: casual.name, email: casual.email })
      const transaction = await Builder.createRandomTransaction(user, PAYMENT_METHOD.DEBIT_CARD, { value : 100 });

      const date = await DebitCardPayableProvider.applyPayementDate(transaction)

      should.exist(date);

      date.should.be.eql(transaction.created_at);
    })

  })

  context('credit card', () => {

    it('should apply status of paid', async () => {

      const user        = await User.create({ name: casual.name, email: casual.email })
      const transaction = await Builder.createRandomTransaction(user, PAYMENT_METHOD.DEBIT_CARD);

      const status      = await CreditCardPayableProvider.applyStatus(transaction)

      should.exist(status);

      status.should.be.eql(PAYABLE_STATUS.WAITING_FUNDS);
    })

    it('should apply fee in value (5%)', async () => {

      const user        = await User.create({ name: casual.name, email: casual.email })
      const transaction = await Builder.createRandomTransaction(user, PAYMENT_METHOD.DEBIT_CARD, { value : 100 });

      const value = await CreditCardPayableProvider.applyFee(transaction)

      should.exist(value);

      value.should.be.eql(95);
    })

    it('should apply payment date + D30', async () => {

      const user        = await User.create({ name: casual.name, email: casual.email })
      const transaction = await Builder.createRandomTransaction(user, PAYMENT_METHOD.DEBIT_CARD, { value : 100 });
      const date        = await CreditCardPayableProvider.applyPayementDate(transaction)

      should.exist(date);

      date.should.be.eql(moment(transaction.created_at).add(30, 'd'));
    })

  })

});
