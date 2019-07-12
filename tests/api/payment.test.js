'use strict'

//###################################
// NPM MODULES
//###################################

const _              = require('lodash');
const chai           = require('chai');
const chaiAsPromised = require('chai-as-promised');
const casual         = require('casual');
const mongoose       = require('mongoose');
const moment         = require('moment');
const sinon          = require('sinon');

chai.use(chaiAsPromised);
const should         = chai.should();
const expect         = chai.expect;

//###################################
// LOCAL MODULES
//###################################

const bootstrap                 = require('../../server');
const TransactionService        = require('../../app/service/transaction');
const PayableService            = require('../../app/service/payable-service');
const Builder                   = require('../util/builder');

const User                      = mongoose.model('user');

//###################################
// INIT
//###################################

describe('Payment API', () => {

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

  context('cash in', () => {

    it('should make transaction', async () => {

      const stub  = sinon.spy(TransactionService, 'create');

      const user    = await User.create({ name: casual.name, email: casual.email })
      const payload = Builder._getTransactionObject(user, 'debit_card');

      const options = {
        method  : 'POST',
        url     : '/payment/cash/in',
        auth    : {
          strategy    : 'jwt',
          credentials : user
        },
        payload : _.omit(payload, ['user'])
      };

      try {

        const response = await server.inject(options)

        should.exist(response);

        const { statusCode, result } = response;

        statusCode.should.be.eql(201);

        should.exist(result);
        should.exist(result._id);

      } finally {
        stub.restore();
      }
    })

  })

  context('cash out', () => {

    it('should make payable', async () => {

      const stub  = sinon.spy(PayableService, 'create');

      const user        = await User.create({ name: casual.name, email: casual.email })
      const transaction = await Builder.createRandomTransaction(user, 'credit_card')

      const options = {
        method  : 'POST',
        url     : `/payment/${transaction._id}/cash/out`,
        auth    : {
          strategy    : 'jwt',
          credentials : user
        }
      };

      try {

        const response = await server.inject(options)

        should.exist(response);

        const { statusCode, result } = response;

        statusCode.should.be.eql(201);

        should.exist(result);
        should.exist(result._id);

      } finally {
        stub.restore();
      }
    })

    it('should throw 404 when transaction is not found', async () => {

      const stub        = sinon.spy(PayableService, 'create');
      const user        = await User.create({ name: casual.name, email: casual.email })

      const options = {
        method  : 'POST',
        url     : `/payment/${mongoose.Types.ObjectId()}/cash/out`,
        auth    : {
          strategy    : 'jwt',
          credentials : user
        }
      };

      try {

        const response = await server.inject(options)

        should.exist(response);

        const { statusCode, result } = response;

        should.exist(result);

        statusCode.should.be.eql(404);
        result.code.should.be.eql('transaction.not.found')

      } finally {
        stub.restore();
      }
    })

  })

  context('payable', () => {

    it('should list payables by status', async () => {

      const user1            = await User.create({ name: casual.name, email: casual.email })
      const user2            = await User.create({ name: casual.name, email: casual.email })

      const [ p1, p2, p3 ]  = await Promise.all([
          await Builder.createRandomTransaction(user1, 'credit_card').then(transaction => PayableService.create(transaction)),
          await Builder.createRandomTransaction(user1, 'debit_card').then(transaction => PayableService.create(transaction)),
          await Builder.createRandomTransaction(user2, 'debit_card').then(transaction => PayableService.create(transaction)),
        ])

      const options = {
        method  : 'GET',
        url     : `/payment/payables?status=paid`,
        auth    : {
          strategy    : 'jwt',
          credentials : user1
        }
      };

      const response = await server.inject(options)

      should.exist(response);

      const { statusCode, result } = response;

      statusCode.should.be.eql(200);

      should.exist(result);

      result.should.have.lengthOf(1);
      result[0]._id.toString().should.be.eql(p2._id.toString());
    })
  })
});