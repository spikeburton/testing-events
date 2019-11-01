const chai = require('chai');
const td = require('testdouble');
const { EventEmitter } = require('events');

const net = td.replace('net');
const anything = td.matchers.anything();

const ping = require('../src');

describe('ping', () => {
  let client;

  beforeEach(() => {
    client = new EventEmitter();
    client.connect = td.func();
    client.setTimeout = td.func();
    client.destroy = td.func();

    td.when(new net.Socket()).thenReturn(client);
    td.when(client.destroy()).thenDo(() => client.removeAllListeners());
  });
  afterEach(() => td.reset());

  it('should return true on connect', async () => {
    td.when(client.connect(anything, anything)).thenDo(() => {
      client.emit('connect');
    });

    try {
      const response = await ping('google.com', 80);
      chai.assert.isTrue(response);
    } catch (err) {
      chai.assert.fail(err.error);
    }
  });
  it('should return false on timeout', async () => {
    td.when(client.setTimeout(anything)).thenDo(() => client.emit('timeout'));

    try {
      const response = await ping('google.com', 80);
      chai.assert.isFalse(response);
    } catch (err) {
      chai.assert.fail(err.error);
    }
  });
  it('should reject the Promise on error', async () => {
    td.when(client.connect(anything, anything)).thenDo(() => {
      client.emit('error');
    });

    try {
      const response = await ping('google.com', 80);
      chai.assert.fail(
        `Promise should reject, instead resolved with: ${response}`
      );
    } catch (err) {
      chai.assert.isObject(err);
      chai.expect(err).to.haveOwnProperty('error');
    }
  });
});
